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
const restaurants = vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nrestaurants');
fs.mkdirSync(path.join(output, 'menus'));
for (const restaurant of restaurants) {
  const file = `${restaurant.id}.html`;
  const html = fs.readFileSync(path.join(root, 'menus', file), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!script) throw new Error(`Missing menu script: ${file}`);
  new vm.Script(script[1], { filename: file });
  fs.writeFileSync(path.join(output, 'menus', file), html);
}
for (const file of ['app.js', 'data.js']) {
  new vm.Script(fs.readFileSync(path.join(output, file), 'utf8'), { filename: file });
}
console.log(`GitHub Pages build ready: _site (${restaurants.length} menu pages).`);
