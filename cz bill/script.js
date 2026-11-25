'use strict';
const KEY='codezone.clients.v1', $=s=>document.querySelector(s), form=$('#client-form');
const fields=['clientName','businessName','address','phone','email','website','admin','renewal','plan','duration','start','expiry','amount','payment','notes'];
let clients=[], editing=null, selected=null, dirty=false, storageBlocked=false, toastTimer;
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(v);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number(s.slice(0,4))>=1900&&Number(s.slice(0,4))<=9998&&!isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const day=s=>Date.parse(s+'T00:00:00Z')/86400000;
const dateText=s=>validDate(s)?new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T00:00:00Z')):s;
function addMonths(start,months){const [y,m,d]=start.split('-').map(Number);const target=new Date(Date.UTC(y,m-1+months,1));const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(d,last));return target.toISOString().slice(0,10);}
function status(c){const diff=day(c.expiry)-day(today());return diff<0?'expired':diff<=30?'soon':'active';}
const statusLabel=s=>({active:'Active',soon:'Expiring soon',expired:'Expired'}[s]);
const durationLabel=v=>({'1':'Monthly','3':'3 Months','6':'6 Months','12':'1 Year',custom:'Custom'}[v]);
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4000);}
function validate(c){if(!c.clientName.trim()||!c.businessName.trim())throw Error('Client name and business name are required.');if(!validDate(c.start)||!validDate(c.expiry))throw Error('Enter valid start and expiry dates (1900–9998).');if(c.expiry<c.start)throw Error('Expiry date cannot be before the start date.');if(!Number.isFinite(c.amount)||c.amount<0||c.amount>999999999)throw Error('Enter a valid amount between ₹0 and ₹999,999,999.');if(!['1','3','6','12','custom'].includes(c.duration)||!['Paid','Pending'].includes(c.payment))throw Error('Invalid duration or payment status.');for(const field of ['website','admin','renewal'])if(c[field]){let u;try{u=new URL(c[field]);}catch{throw Error('Enter complete URLs beginning with https:// or http://.');}if(!['https:','http:'].includes(u.protocol))throw Error('Only HTTP and HTTPS links are supported.');}if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))throw Error('Enter a valid email address.');return c;}
function normalize(raw){if(!raw||typeof raw!=='object')throw Error('Invalid client record.');const c={};for(const k of fields)c[k]=k==='amount'?Number(raw[k]):String(raw[k]??'');if(raw.amount===''||raw.amount===null||raw.amount===undefined)throw Error('Missing subscription amount.');c.id=typeof raw.id==='string'&&raw.id?raw.id:crypto.randomUUID();return validate(c);}
function persist(next){if(storageBlocked){toast('Storage recovery required. Back up records, then restore a valid backup.');return false;}try{localStorage.setItem(KEY,JSON.stringify(next));clients=next;render();return true;}catch{toast('Could not save: browser storage is unavailable or full. Export a backup.');return false;}}
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw Error();clients=parsed.map(normalize);if(new Set(clients.map(c=>c.id)).size!==clients.length)throw Error();}}catch{storageBlocked=true;$('#storage-warning').hidden=false;$('#storage-warning').textContent='Stored data could not be loaded. It has not been overwritten. Backup exports the original data; restore a valid backup to recover.';}render();}
function render(){const soon=clients.filter(c=>status(c)==='soon').length, expired=clients.filter(c=>status(c)==='expired').length;const stats=[['Total clients',clients.length,'Your growing portfolio','▦'],['Active subscriptions',clients.length-expired,'Includes upcoming renewals','↗'],['Expired subscriptions',expired,'Ready for a follow-up','◴'],['Upcoming renewals',soon,'Within the next 30 days','◷'],['Subscription revenue',money(clients.filter(c=>c.payment==='Paid').reduce((s,c)=>s+c.amount,0)),'Paid records · current subscriptions','₹']];$('#stats').innerHTML=stats.map(([l,v,n,i])=>`<article class="stat"><div class="stat-label">${l}<span class="stat-icon">${i}</span></div><div class="stat-value">${v}</div><div class="stat-note">${n}</div></article>`).join('');const query=$('#search').value.trim().toLowerCase(), filter=$('#status-filter').value;let rows=clients.filter(c=>(c.clientName+' '+c.businessName).toLowerCase().includes(query)&&(filter==='all'||status(c)===filter));rows.sort((a,b)=>$('#sort').value==='name'?a.businessName.localeCompare(b.businessName):($('#sort').value==='desc'?-1:1)*a.expiry.localeCompare(b.expiry));$('#clients').innerHTML=rows.map(c=>`<tr><td><button class="client-link" data-action="view" data-id="${escapeHTML(c.id)}"><span class="initials">${escapeHTML(c.businessName.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span><span><span class="client-name">${escapeHTML(c.clientName)}</span><span class="business-name">${escapeHTML(c.businessName)}</span></span></button></td><td data-label="Plan">${escapeHTML(c.plan||'—')}</td><td class="price" data-label="Price">${money(c.amount)}</td><td data-label="Start date">${dateText(c.start)}</td><td data-label="Expiry date">${dateText(c.expiry)}</td><td data-label="Status"><span class="badge ${status(c)}">${statusLabel(status(c))}</span></td><td><div class="actions"><button data-action="view" data-id="${escapeHTML(c.id)}" aria-label="View ${escapeHTML(c.businessName)}">View</button><button data-action="pdf" data-id="${escapeHTML(c.id)}" aria-label="Download PDF for ${escapeHTML(c.businessName)}">↓ PDF</button></div></td></tr>`).join('');$('#client-count').textContent=clients.length;$('#result-count').textContent=`Showing ${rows.length} of ${clients.length} clients`;$('#empty').hidden=rows.length>0;$('#empty-title').textContent=clients.length?'No matching clients':'Your next client starts here';$('#empty-copy').textContent=clients.length?'Try a different search or subscription status.':'Add a client to track their website, subscription, and renewal.';$('#empty-add').hidden=clients.length>0;}
function syncExpiry(){const custom=form.elements.duration.value==='custom';form.elements.expiry.readOnly=!custom;$('#expiry-hint').textContent=custom?'Choose your custom expiry date':'Calculated from the start date';if(!custom&&validDate(form.elements.start.value))form.elements.expiry.value=addMonths(form.elements.start.value,Number(form.elements.duration.value));}
function openEditor(c){editing=c?.id??null;form.reset();$('#form-error').textContent='';if(c)for(const k of fields)form.elements[k].value=c[k];else form.elements.start.value=today();$('#editor-title').textContent=c?'Edit client':'Add new client';syncExpiry();dirty=false;$('#editor').showModal();}
function closeEditor(){if(dirty&&!confirm('Discard the unsaved changes to this client?'))return;$('#editor').close();dirty=false;}
function readForm(){if(!form.reportValidity())return null;try{const c=Object.fromEntries(fields.map(k=>[k,form.elements[k].value.trim()]));c.amount=Number(c.amount);c.id=editing||crypto.randomUUID();validate(c);$('#form-error').textContent='';return c;}catch(e){$('#form-error').textContent=e.message;return null;}}
function showDetails(c){selected=c.id;$('#detail-title').textContent=c.businessName;const entry=(label,value,wide=false)=>`<div class="${wide?'wide':''}"><dt>${label}</dt><dd>${escapeHTML(value||'—')}</dd></div>`;const link=(label,key,button)=>c[key]?`<div class="wide"><dt>${label}</dt><dd><a href="${escapeHTML(c[key])}" target="_blank" rel="noopener noreferrer">${escapeHTML(c[key])}</a><div><a href="${escapeHTML(c[key])}" target="_blank" rel="noopener noreferrer">${button}</a><button data-copy="${key}">Copy URL</button></div></dd></div>`:'';$('#detail-body').innerHTML=`<div class="detail-highlight"><div><span class="badge ${status(c)}">${statusLabel(status(c))}</span><strong>${money(c.amount)}</strong><p>${escapeHTML(c.payment)} · ${escapeHTML(c.plan||'Subscription')}</p></div><div><p>Renewal date</p><strong>${dateText(c.expiry)}</strong><p>${durationLabel(c.duration)}</p></div></div><dl class="detail-grid">${entry('Client name',c.clientName)}${entry('Business name',c.businessName)}${entry('Full address',c.address,true)}${entry('Phone',c.phone)}${entry('Email',c.email)}${link('Website','website','Open website ↗')}${link('Admin','admin','Open admin ↗')}${link('Payment / renewal','renewal','Open renewal link ↗')}${entry('Start date',dateText(c.start))}${entry('Expiry date',dateText(c.expiry))}${entry('Notes',c.notes,true)}</dl>`;if(!$('#details').open)$('#details').showModal();}
async function copy(text){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';(document.querySelector('dialog[open]')||document.body).append(el);el.select();const ok=document.execCommand('copy');el.remove();if(!ok)throw Error();}toast('Copied to clipboard');}catch{toast('Clipboard unavailable. Select and copy the text manually.');}}
function clientText(c){return [['Client',c.clientName],['Business',c.businessName],['Address',c.address],['Phone',c.phone],['Email',c.email],['Website',c.website],['Admin URL',c.admin],['Renewal URL',c.renewal],['Plan',c.plan],['Duration',durationLabel(c.duration)],['Start',dateText(c.start)],['Expiry',dateText(c.expiry)],['Price',money(c.amount)],['Payment',c.payment],['Notes',c.notes]].filter(x=>x[1]).map(x=>x.join(': ')).join('\n');}
// Measure the complete content before drawing; every export stays on one A4 page.
function generatePDF(c){
 try {
  if(!window.jspdf||!window.CODEZONE_FONT)throw Error('PDF assets are missing. Keep the vendor folder beside index.html.');
  const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
  doc.addFileToVFS('NotoSans.ttf',window.CODEZONE_FONT);
  doc.addFont('NotoSans.ttf','NotoSans','normal');doc.setFont('NotoSans');
  const groups=[
   ['CLIENT INFORMATION',[['Client name',c.clientName],['Business name',c.businessName],['Business address',c.address],['Phone',c.phone],['Email',c.email]]],
   ['WEBSITE INFORMATION',[['Website',c.website],['Admin URL',c.admin],['Payment / renewal',c.renewal]]],
   ['SUBSCRIPTION DETAILS',[['Plan',c.plan],['Duration',durationLabel(c.duration)],['Payment status',c.payment]]],
   ['ADDITIONAL NOTES',[['Notes',c.notes]]]
  ];
  function measure(size){
   const lineHeight=size*0.352778*1.32, gap=size*.24;
   let height=0;
   const sections=groups.map(([title,fields])=>{
    const rows=fields.filter(([,value])=>value).map(([label,value])=>{
     doc.setFontSize(size);
     const lines=doc.splitTextToSize(String(value),129);
     doc.setFontSize(size*.83);
     const labels=doc.splitTextToSize(label,37);
     const h=Math.max(lines.length*lineHeight,labels.length*lineHeight*.83)+gap;
     return {lines,labels,h};
    });
    if(rows.length)height+=size*.9+rows.reduce((sum,row)=>sum+row.h,0)+size*.35;
    return {title,rows};
   });
   return {sections,height,lineHeight,gap};
  }
  let size=10,layout=measure(size);
  // Reduce proportionally, then rewrap; no fields are truncated or dropped.
  for(let i=0;layout.height>185&&i<100;i++){
   size*=Math.min(.96,Math.sqrt(185/layout.height));layout=measure(size);
  }
  if(layout.height>185)throw Error('Content could not be fitted. Please shorten the notes.');
  doc.setFillColor(24,34,54);doc.rect(0,0,210,40,'F');
  doc.setTextColor(180,173,246);doc.setFontSize(10);doc.text('CODE ZONE',16,12);
  doc.setTextColor(255,255,255);doc.setFontSize(17);doc.text('WEBSITE SUBSCRIPTION DETAILS',16,24);
  doc.setTextColor(197,203,216);doc.setFontSize(9);doc.text('Website Service & Subscription Record',16,33);
  doc.setFillColor(242,240,251);doc.roundedRect(16,47,178,30,3,3,'F');
  doc.setTextColor(110,103,148);doc.setFontSize(8);
  doc.text('START DATE',21,55);doc.text('EXPIRY DATE',78,55);doc.text('SUBSCRIPTION PRICE',135,55);
  doc.setTextColor(63,51,119);doc.setFontSize(11);
  doc.text(dateText(c.start),21,66);doc.text(dateText(c.expiry),78,66);
  const price=money(c.amount);doc.setFontSize(Math.min(12,12*53/doc.getTextWidth(price)));doc.text(price,135,66);
  let y=87;
  for(const section of layout.sections){
   if(!section.rows.length)continue;
   doc.setFillColor(242,240,251);doc.rect(16,y-size*.38,178,size*.78,'F');
   doc.setTextColor(89,75,178);doc.setFontSize(size*.9);doc.text(section.title,19,y);y+=size*.9;
   for(const row of section.rows){
    doc.setFontSize(size*.83);doc.setTextColor(120,128,145);
    row.labels.forEach((line,i)=>doc.text(line,18,y+i*layout.lineHeight*.83));
    doc.setFontSize(size);doc.setTextColor(36,46,66);
    row.lines.forEach((line,i)=>doc.text(line,63,y+i*layout.lineHeight));y+=row.h;
   }
   y+=size*.35;
  }
  doc.setDrawColor(228,231,237);doc.line(16,281,194,281);
  doc.setTextColor(135,143,156);doc.setFontSize(8);
  doc.text('Generated '+dateText(today())+' · CODE ZONE',16,288);doc.text('1 / 1',194,288,{align:'right'});
  const name=c.businessName.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'').trim().replace(/\s+/g,'_').slice(0,100)||'Client';
  doc.save(name+'_Subscription.pdf');
  toast(size<7?'Single-page PDF downloaded. Long content uses smaller text.':'Single-page PDF downloaded');
 }catch(e){toast(e.message||'Unable to generate PDF.');}
}
function downloadJSON(data){const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`CodeZone_Backup_${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#add-client').onclick=$('#empty-add').onclick=()=>openEditor();document.querySelectorAll('.close-editor').forEach(b=>b.onclick=closeEditor);$('#editor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});form.addEventListener('input',()=>dirty=true);form.elements.start.onchange=syncExpiry;form.elements.duration.onchange=syncExpiry;form.onsubmit=e=>{e.preventDefault();const c=readForm();if(!c)return;const next=editing?clients.map(x=>x.id===editing?c:x):[...clients,c];if(persist(next)){dirty=false;$('#editor').close();if($('#details').open)showDetails(c);toast(editing?'Client updated':'Client added');}};$('#draft-pdf').onclick=()=>{const c=readForm();if(c)generatePDF(c);};$('#clients').onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const c=clients.find(x=>x.id===b.dataset.id);if(c)b.dataset.action==='pdf'?generatePDF(c):showDetails(c);};$('#close-details').onclick=()=>$('#details').close();$('#edit-client').onclick=()=>openEditor(clients.find(c=>c.id===selected));$('#detail-pdf').onclick=()=>generatePDF(clients.find(c=>c.id===selected));$('#copy-details').onclick=()=>copy(clientText(clients.find(c=>c.id===selected)));$('#detail-body').onclick=e=>{const b=e.target.closest('[data-copy]');if(b)copy(clients.find(c=>c.id===selected)[b.dataset.copy]);};$('#delete-client').onclick=()=>{const c=clients.find(c=>c.id===selected);if(confirm(`Delete ${c.businessName}? This cannot be undone. Export a backup first if needed.`)&&persist(clients.filter(x=>x.id!==selected))){$('#details').close();toast('Client deleted');}};$('#search').oninput=render;$('#status-filter').onchange=render;$('#sort').onchange=render;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('selected',x===b));$('#status-filter').value=b.dataset.view;$('#breadcrumb').textContent=b.textContent.trim().slice(1).trim();$('#page-title').textContent=b.dataset.view==='all'?'Subscription overview':b.dataset.view==='soon'?'Upcoming renewals':'Expired subscriptions';$('#list-title').firstChild.textContent=b.dataset.view==='all'?'All clients ':b.dataset.view==='soon'?'Renewing soon ':'Expired clients ';render();});$('#backup').onclick=()=>{try{downloadJSON(storageBlocked?(localStorage.getItem(KEY)||'[]'):JSON.stringify({version:1,exportedAt:new Date().toISOString(),clients},null,2));toast('Backup downloaded');}catch{toast('Cannot access browser storage.');}};$('#restore').onclick=()=>$('#import-file').click();$('#import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error('Backup is too large (maximum 10 MB).');const data=JSON.parse(await file.text()),raw=Array.isArray(data)?data:data.version===1?data.clients:null;if(!Array.isArray(raw))throw Error('This is not a supported backup file.');const next=raw.map(normalize);if(new Set(next.map(c=>c.id)).size!==next.length)throw Error('Backup contains duplicate record IDs.');if(!confirm(`Replace all current records with ${next.length} clients from this backup? Download a backup of your existing records first.`))return;localStorage.setItem(KEY,JSON.stringify(next));clients=next;storageBlocked=false;$('#storage-warning').hidden=true;render();toast('Backup restored');}catch(err){toast('Restore failed: '+err.message);}finally{e.target.value='';}};window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});window.addEventListener('storage',e=>{if(e.key===KEY){if(dirty){storageBlocked=true;$('#storage-warning').hidden=false;$('#storage-warning').textContent='Records changed in another tab. Copy unsaved changes, then reload before saving.';}else load();}});document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});load();
