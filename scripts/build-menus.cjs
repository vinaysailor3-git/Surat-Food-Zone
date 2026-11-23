// Rebuild each self-contained menu page after editing data.js or the template.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { defaultWhatsAppNumber } = JSON.parse(fs.readFileSync(path.join(root, 'site-config.json'), 'utf8'));
if (!/^[1-9]\d{7,14}$/.test(defaultWhatsAppNumber)) throw new Error('Use an international WhatsApp number with digits only.');
const restaurants = vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nrestaurants');
const template = fs.readFileSync(path.join(root, 'templates/menu.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
fs.mkdirSync(path.join(root, 'menus'), { recursive: true });
for (const restaurant of restaurants) {
  if (restaurant.profileTemplate) {
    const profile = fs.readFileSync(path.join(root, 'templates/restaurant-profile.html'), 'utf8')
      .replace('{{profileStyles}}', () => fs.readFileSync(path.join(root, 'templates/restaurant-profile.css'), 'utf8'))
      .replace('{{profileScript}}', () => fs.readFileSync(path.join(root, 'templates/restaurant-profile.js'), 'utf8'));
    const sections = [...new Set(restaurant.menu.map(item => item.section))];
    const menu = sections.map(section => `<section class="menu-category"><h3>${escape(section)}</h3><dl>${restaurant.menu.filter(item => item.section === section).map(item => `<div><dt>${escape(item.name)}</dt><dd>₹${escape(item.price)}</dd></div>`).join('')}</dl></section>`).join('\n');
    const html = profile.replaceAll('{{name}}', escape(restaurant.name)).replaceAll('{{image}}', escape(restaurant.image)).replaceAll('{{imageAlt}}', escape(restaurant.imageAlt)).replaceAll('{{description}}', escape(restaurant.description)).replaceAll('{{cuisine}}', escape(restaurant.cuisine)).replace('{{menu}}', menu);
    fs.writeFileSync(path.join(root, `menus/${restaurant.id}.html`), html);
    continue;
  }
  // Preserve supplied standalone restaurant pages.
  if (['zaam-chinins', 'quite-momo'].includes(restaurant.id)) {
    if (!fs.existsSync(path.join(root, 'menus', `${restaurant.id}.html`))) throw new Error(`Missing landing page: ${restaurant.id}`);
    continue;
  }
  // Suzu has an independent presentation page, without ordering controls.
  if (restaurant.id === 'suzu-chinese') {
    if (!fs.existsSync(path.join(root, 'menus', 'suzu-chinese.html'))) throw new Error('Missing Suzu landing page');
    continue;
  }
  const items = JSON.stringify(restaurant.menu.map(({ name, price }) => ({ name, price }))).replace(/</g, '\\u003c');
  let html = template.replace(/const menuItems = \[[\s\S]*?\];/, `const menuItems = ${items};`)
    .replaceAll('City Tadka', escape(restaurant.name))
    .replaceAll('CITY TADKA', restaurant.name.toUpperCase())
    .replaceAll('city-tadka-order.png', `${restaurant.id}-order.png`)
    .replaceAll('Chinese Menu', escape(restaurant.category) + ' Menu')
    .replace('const phoneNumber = "917874227737";', `const phoneNumber = "${defaultWhatsAppNumber}";`)
    .replace('window.open(url, "_blank");', 'window.open(url, "_blank", "noopener,noreferrer");')
    .replace('Check your selected items before sending the order.', 'Check your selection, then open WhatsApp to review and send your order. You can also save or share it as an image.')
    .replace('<main class="container">', '<main class="container"><a class="back-link" href="../index.html#restaurants">Back to Surat Food Zone</a>')
    .replace('Select your favourite items</p>', `Select your favourite items</p><p class="menu-note">${restaurant.isSample === false ? 'Restaurant menu prices. Address coming soon.' : 'Sample restaurant and illustrative menu prices.'}</p>`)
    .replace('ctx.font = "bold 54px Arial";', 'ctx.font = "bold 40px Arial";')
    .replace('const rowHeight = 64;', 'const rowHeight = 84;')
    .replace('let generatedOrderFile = null;', 'let generatedOrderFile = null;')
    .replace('      canvas.toBlob(blob => {', '      generatedOrderBlob = null;\n      generatedOrderFile = null;\n      document.getElementById("share-order-image").disabled = true;\n      document.getElementById("download-order-image").disabled = true;\n      canvas.toBlob(blob => {')
    .replace('        generatedOrderBlob = blob;', '        generatedOrderBlob = blob;\n        document.getElementById("share-order-image").disabled = false;\n        document.getElementById("download-order-image").disabled = false;')
    .replace('<div class="image-modal" id="image-modal" role="dialog" aria-modal="true" aria-labelledby="image-modal-title">', '<dialog class="image-modal" id="image-modal" aria-labelledby="image-modal-title">')
    .replace('  </div>\n\n\n  <script>', '  </dialog>\n\n\n  <script>')
    .replace('document.getElementById("image-modal").classList.add("open");', 'document.getElementById("image-modal").showModal();')
    .replaceAll('document.getElementById("image-modal").classList.remove("open");', 'document.getElementById("image-modal").close();')
    .replace('event.currentTarget.classList.remove("open");', 'event.currentTarget.close();')
    .replace('</style>', `
    :root { --gradient: linear-gradient(115deg,#cc4509,#c9252d); }
    body { background: linear-gradient(115deg,#fffaf6,#fff7f8); font-size:16px; }
    header { background:var(--gradient); color:white; border:0; margin-top:18px; }
    header p, header .menu-note { color:white; line-height:1.6; }
    header .menu-note { font-size:13px; margin-top:12px; }
    .back-link { color:#ad2530; font-size:14px; }
    .item-name { font-size:16px; } .item-price { font-size:14px; }
    .quantity button { width:40px; height:40px; }
    #copy-order, #share-order-image, #download-order-image { background:var(--gradient); }
    button:focus-visible, a:focus-visible { outline:3px solid #c9252d; outline-offset:3px; }
    .image-modal { border:0; background:white; padding:0; width:min(520px,calc(100% - 32px)); height:fit-content; max-height:90vh; border-radius:14px; }
    .image-modal[open] { display:block; }
    .image-modal::backdrop { background:#0009; }
    .modal-card { max-height:none; }
    button:disabled { opacity:.45; cursor:not-allowed; }
    .order-actions { width:auto; flex:1; }
    @media(max-width:480px) { .bottom-inner { flex-wrap:wrap; } .bottom-total { width:100%; display:flex; justify-content:space-between; align-items:center; } body { padding-bottom:160px; } }
    </style>`);
  html = html.replace('</style>', fs.readFileSync(path.join(root, 'templates/menu-responsive.css'), 'utf8') + '\n</style>');
  fs.writeFileSync(path.join(root, `menus/${restaurant.id}.html`), html);
}
console.log(`Generated ${restaurants.length} individual menu pages.`);
