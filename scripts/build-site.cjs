// Only public website files go into the GitHub Pages artifact.
// No dependencies or package installation required.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '_site');

require('./build-menus.cjs');

// _site is disposable build output, never source or a user-selected path.
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) {
  throw new Error('Refusing to replace a linked build directory.');
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'data.js', 'logo.png', '.nojekyll']) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
// Include shared restaurant logos and other public assets.
if (fs.existsSync(path.join(root, 'assets'))) {
  fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
}
const restaurants = vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nrestaurants');
fs.mkdirSync(path.join(output, 'menus'));
for (const restaurant of restaurants) {
  const file = `${restaurant.id}.html`;
  const html = fs.readFileSync(path.join(root, 'menus', file), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  if (restaurant.id === 'suzu-chinese') {
    const assets = path.join(root, 'menus', 'suzu-chinese');
    new vm.Script(fs.readFileSync(path.join(assets, 'script.js'), 'utf8'), { filename: 'suzu-chinese/script.js' });
    fs.cpSync(assets, path.join(output, 'menus', 'suzu-chinese'), { recursive: true });
  } else if (!script) throw new Error(`Missing menu script: ${file}`);
  if (script) new vm.Script(script[1], { filename: file });
  fs.writeFileSync(path.join(output, 'menus', file), html);
}
for (const file of ['app.js', 'data.js']) {
  new vm.Script(fs.readFileSync(path.join(output, file), 'utf8'), { filename: file });
}
console.log(`GitHub Pages build ready: _site (${restaurants.length} menu pages).`);
