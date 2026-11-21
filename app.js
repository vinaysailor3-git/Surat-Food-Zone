const state = { query: '', category: '', type: '' };
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

$('#category-grid').innerHTML = foodCategories.map(category => `<button class="category" data-category="${escapeHTML(category.name)}" aria-pressed="false"><span class="category-icon" aria-hidden="true">${category.icon}</span>${escapeHTML(category.name)}</button>`).join('');
$('#place-types').innerHTML = placeTypes.map(type => `<button class="place-card" data-type="${escapeHTML(type.name)}" aria-pressed="false"><span class="place-icon" aria-hidden="true">${type.icon}</span><strong>${escapeHTML(type.name)}</strong><small>${escapeHTML(type.description)}</small></button>`).join('');

function matchingRestaurants() {
  return restaurants.filter(restaurant => {
    const searchable = [restaurant.name, restaurant.area, restaurant.description, ...restaurant.categories, ...restaurant.types, ...restaurant.menu.map(item => item.name + ' ' + item.description)].join(' ').toLowerCase();
    return state.query.toLowerCase().split(/\s+/).every(word => searchable.includes(word)) && (!state.category || restaurant.categories.includes(state.category)) && (!state.type || restaurant.types.includes(state.type));
  });
}
function renderRestaurants() {
  const results = matchingRestaurants();
  $('#restaurant-grid').innerHTML = results.map(restaurant => `<article class="restaurant-card"><div class="card-photo"><img src="${escapeHTML(restaurant.image)}" alt="${escapeHTML(restaurant.imageAlt)}" loading="lazy"><span class="card-tag">${escapeHTML(restaurant.category)}</span></div><div class="card-body"><h3>${escapeHTML(restaurant.name)}</h3><p class="location">⌖ &nbsp; ${escapeHTML(restaurant.area)}</p><p class="card-description">${escapeHTML(restaurant.description)}</p><div class="card-bottom"><span>${restaurant.isSample === false ? 'Menu available · Illustrative photo' : 'Sample restaurant'}</span><a class="menu-button" href="menus/${encodeURIComponent(restaurant.id)}.html" aria-label="View menu for ${escapeHTML(restaurant.name)}">View Menu</a></div></div></article>`).join('');
  $('#result-count').textContent = `${results.length} ${results.length === 1 ? 'place' : 'places'} to discover${state.category ? ' · ' + state.category : ''}${state.type ? ' · ' + state.type : ''}${state.query ? ' · “' + state.query + '”' : ''}`;
  $('#clear-filters').hidden = !(state.query || state.category || state.type);
  $('#empty-state').hidden = results.length !== 0;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
  document.querySelectorAll('[data-type]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === state.type)));
}
function resetFilters() { state.query = ''; state.category = ''; state.type = ''; $('#search-input').value = ''; renderRestaurants(); }
function showResults() { $('#restaurants').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
$('#search-input').addEventListener('input', event => { state.query = event.target.value.trim(); renderRestaurants(); });
$('#search').addEventListener('submit', event => { event.preventDefault(); renderRestaurants(); showResults(); });
$('#clear-filters').addEventListener('click', resetFilters);
$('#reset-search').addEventListener('click', resetFilters);
$('#category-grid').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; state.category = state.category === button.dataset.category ? '' : button.dataset.category; renderRestaurants(); showResults(); });
$('#place-types').addEventListener('click', event => { const button = event.target.closest('[data-type]'); if (!button) return; state.type = state.type === button.dataset.type ? '' : button.dataset.type; renderRestaurants(); showResults(); });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { resetFilters(); state.query = button.dataset.query; $('#search-input').value = state.query; renderRestaurants(); showResults(); }));

const dialog = $('#menu-dialog');
$('#restaurant-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-menu]');
  if (!button) return;
  const restaurant = restaurants.find(item => item.id === button.dataset.menu);
  const sections = [...new Set(restaurant.menu.map(item => item.section))];
  $('#menu-content').innerHTML = `<div class="menu-intro"><span class="sample-pill">Sample menu</span><h2 id="menu-title">${escapeHTML(restaurant.name)}</h2><p>${escapeHTML(restaurant.category)} · ${escapeHTML(restaurant.area)}</p></div>${sections.map(section => `<h3 class="menu-section">${escapeHTML(section)}</h3>${restaurant.menu.filter(item => item.section === section).map(item => `<div class="menu-item"><div><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.description)}</p></div><strong>${currency(item.price)}</strong></div>`).join('')}`).join('')}<p class="menu-disclaimer">Illustrative dishes and prices only. Actual restaurant details and menus will be added later.</p>`;
  dialog.showModal(); document.body.classList.add('modal-open');
});
$('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); });
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
$('.nav-toggle').addEventListener('click', () => { const open = $('.nav-toggle').getAttribute('aria-expanded') !== 'true'; $('.nav-toggle').setAttribute('aria-expanded', String(open)); $('#navigation').classList.toggle('is-open', open); });
$('#navigation').addEventListener('click', event => { if (!event.target.closest('a')) return; $('.nav-toggle').setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('is-open'); if (event.target.closest('a').getAttribute('href') === '#search') $('#search-input').focus({ preventScroll: true }); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { $('.nav-toggle').setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('is-open'); } });
$('#year').textContent = new Date().getFullYear();
renderRestaurants();
