const toggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('#navigation');
const header = document.querySelector('.site-header');
document.documentElement.classList.add('js');
function setNavigation(open) {
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  header.classList.toggle('menu-open', open);
}
toggle.addEventListener('click', () => setNavigation(toggle.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => { if (event.target.closest('a')) setNavigation(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setNavigation(false); toggle.focus(); } });
const desktop = matchMedia('(min-width:761px)');
desktop.addEventListener('change', () => setNavigation(false));
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Progressive enhancement: every menu category is readable without JavaScript.
const panels = [...document.querySelectorAll('.menu-category')];
const tablist = document.querySelector('.menu-tabs');
const tabs = panels.map((panel, index) => {
  const tab = document.createElement('button');
  tab.className = 'menu-tab';
  tab.type = 'button';
  tab.id = `menu-tab-${index}`;
  tab.textContent = panel.querySelector('h3').textContent;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `menu-panel-${index}`);
  panel.id = `menu-panel-${index}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tablist.append(tab);
  tab.addEventListener('click', () => selectCategory(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % panels.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + panels.length) % panels.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = panels.length - 1;
    if (next !== undefined) { event.preventDefault(); selectCategory(next); tabs[next].focus(); }
  });
  return tab;
});
function selectCategory(index) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
}
selectCategory(0);
tablist.hidden = false;

// Native dialog supplies focus containment and Escape-to-close behavior.
const lightbox = document.querySelector('.lightbox');
const gallery = [...document.querySelectorAll('.gallery figure')];
let currentImage = 0;
let opener;
function showImage(index) {
  currentImage = (index + gallery.length) % gallery.length;
  const figure = gallery[currentImage];
  const original = figure.querySelector('img');
  const image = lightbox.querySelector('.lightbox-image');
  image.src = original.src;
  image.alt = original.alt;
  document.querySelector('#lightbox-caption').textContent = figure.querySelector('figcaption').textContent;
  document.querySelector('#lightbox-count').textContent = `${currentImage + 1} / ${gallery.length}`;
}
if (typeof lightbox.showModal === 'function') {
  gallery.forEach((figure, index) => {
    const image = figure.querySelector('img');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-trigger';
    button.setAttribute('aria-label', `Enlarge ${figure.querySelector('figcaption').textContent.toLowerCase()}`);
    button.setAttribute('aria-haspopup', 'dialog');
    image.before(button);
    button.append(image);
    button.addEventListener('click', () => { opener = button; showImage(index); lightbox.showModal(); document.body.classList.add('gallery-open'); });
  });
}
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentImage - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentImage + 1));
lightbox.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(currentImage + (event.key === 'ArrowRight' ? 1 : -1)); } });
lightbox.addEventListener('click', event => { if (event.target === lightbox) { const box = lightbox.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) lightbox.close(); } });
lightbox.addEventListener('close', () => { document.body.classList.remove('gallery-open'); if (opener) opener.focus({preventScroll:true}); });

const dayName = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Kolkata',weekday:'long'}).format(new Date());
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
document.querySelector(`[data-day="${dayNames.indexOf(dayName)}"]`)?.classList.add('today');
document.querySelector('#year').textContent = new Intl.DateTimeFormat('en', {timeZone:'Asia/Kolkata',year:'numeric'}).format(new Date());
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold:.12 });
  document.querySelectorAll('.section').forEach(section => observer.observe(section));
}
