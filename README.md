# Surat Food Zone

Simple HTML, CSS and vanilla JavaScript website, prepared for GitHub Pages.
No framework, backend, paid hosting or npm dependencies.

## One-time GitHub setup

1. Push this project to `vinaysailor3-git/Surat-Food-Zone` on the `main` branch.
2. In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Open **Actions → Deploy Surat Food Zone to GitHub Pages**. If the first push ran before Pages was enabled, select **Run workflow** or rerun it.
4. After the workflow succeeds, the expected address is:
   https://vinaysailor3-git.github.io/Surat-Food-Zone/

Every subsequent push to `main` rebuilds the individual menus and deploys automatically.
No personal access token or custom secret is required. GitHub Pages must be available for your repository/account, and Actions must be enabled.

Official setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## File structure

```text
index.html                    Homepage
styles.css                    Responsive orange/red theme
app.js                        Search, filters and menu links
data.js                       Restaurants and menu prices — edit here
site-config.json              Default WhatsApp number — edit here
menus/                        Generated individual HTML menu pages
templates/menu.html           Source layout for individual menus
scripts/build-menus.cjs        Regenerates menus from data and template
scripts/build-site.cjs         Builds and checks the public _site folder
.github/workflows/deploy-pages.yml  Automatic GitHub Pages deployment
.nojekyll                     Static-site marker
```

`_site/` is generated and ignored by Git. Only its public files are deployed;
templates, configuration, scripts, Git history and local backups are excluded.
The previous OpenAI project and archive are preserved in ignored `.local-backup/`.
There is no OpenAI hosting dependency in the active project.

## Change restaurant menus

Edit `data.js`. Each restaurant needs a unique URL-safe `id`, name, categories,
types and menu items. Set `isSample: false` for real listings. Prices are in INR.
All menus use `site-config.json`'s `defaultWhatsAppNumber` (currently `919106197737`).
Use international format with digits only, without `+` or spaces.

After editing, run `node scripts/build-site.cjs` to regenerate menus and validate
locally. GitHub Actions also does this on every push. For generated menus, edit data.js or templates/menu.html.

## Local preview

Open `index.html` directly, or run `python -m http.server 5173` in this folder and
visit http://localhost:5173. To preview the exact deployment output:

```sh
node scripts/build-site.cjs
python -m http.server 5173 --directory _site
```

Links use relative paths, so they work under GitHub Pages' `/Surat-Food-Zone/`
repository path. Menu URLs end in `.html`.

Photos and Google Fonts need internet access. Individual menu pages are
self-contained. WhatsApp opens a draft; the customer sends it. Image sharing
depends on browser support, with download as the fallback. No payments are taken.

This change prepares deployment files; it does not push the repository, enable
GitHub Pages remotely, or remove an already published site from another host.

## Main website logo
Replace the root logo.png with your new PNG (keep the same filename). The homepage header and footer use this file, and the GitHub Pages build copies it automatically. Commit and push the replacement to update it online.


## Suzu Chinese landing page

`menus/suzu-chinese.html` is the independent, presentation-only Suzu Chinese demo.
Its CSS and JavaScript live in `menus/suzu-chinese/`. The homepage listing lives
in `data.js`, including the full menu for search. Keep that data and the page
menu in sync when changing prices. The build preserves the custom page and
copies its assets. No ordering or WhatsApp features are included on Suzu.
All prices, contact details, hours and the address are fictional demo content.
Food images are representative online photographs.

## ZAAM CHININS

`menus/zaam-chinins.html` is the supplied single-file landing page, with its
branding changed to ZAAM CHININS. Edit this file directly; the menu build
preserves it. Its searchable homepage listing and menu data are in `data.js`.
Keep the listing menu data in sync with the page when changing dishes or prices.

## Quite Momo and featured restaurants

`menus/quite-momo.html` is the supplied standalone QUITE MOMO page, preserved
by the build. Edit its inline MENU data directly and keep `data.js` in sync.
Set `featured: true` on a restaurant in `data.js` to show it in the homepage
spotlight below the hero. Quite Momo, ZAAM CHININS and Suzu Chinese are featured;
all listings remain available in the searchable restaurant section.

## Mokabo Cafe

Mokabo Cafe is listed in `data.js` and opens `menus/mokabo-cafe.html`.
Its menu, prices and listing details have one source of truth in `data.js`.
The build renders its browsing-only page from `templates/restaurant-profile.html`;
edit the template rather than the generated page. Run `node scripts/build-site.cjs`
after changes. The `profileTemplate` flag opts into this informational template,
and `wholeCardLink` makes the listing card clickable.

The page includes six sample photos and three explicitly fictional reviews.
Replace the contact placeholders, Google review place ID and general Surat map
URL in the template before launch. Replace the disabled Call button with a `tel:`
link once a verified number is supplied. External sample photos need internet.

Mokabo styling and interactions live in `templates/restaurant-profile.css` and
`templates/restaurant-profile.js`. The build embeds both in the generated HTML,
so the page also works when opened directly. Menu tabs and gallery controls
progressively enhance the static content. Opening hours and Instagram remain
placeholders; the current day uses Surat’s Asia/Kolkata timezone.
