'use strict';
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('#navigation');
function closeNavigation() { toggle.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeNavigation(); toggle.focus(); } });
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }
window.addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => { document.querySelector('#demo-message').textContent = `${button.dataset.demo} is a demo placeholder. No real restaurant contact is connected.`; }));
const categoryLinks = [...document.querySelectorAll('.category-nav a')];
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => { for (const entry of entries) { if (entry.isIntersecting) { categoryLinks.forEach(link => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } } }, { rootMargin: '-155px 0px -45% 0px', threshold: 0 });
 document.querySelectorAll('.menu-category').forEach(section => observer.observe(section));
 if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('reveal'); reveal.unobserve(entry.target); } }), { threshold: 0.1 }); document.querySelectorAll('.intro, .food-gallery, .visit').forEach(section => reveal.observe(section)); }
}
