import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

console.log('⚡ Menjalankan Vite Single-File Build untuk Standalone HTML Murni...');
execSync('npx vite build --config vite.gas.config.ts', { stdio: 'inherit' });

const distHtmlPath = path.join(rootDir, 'dist-gas', 'index.html');
if (!fs.existsSync(distHtmlPath)) {
  console.error('❌ Gagal menemukan dist-gas/index.html');
  process.exit(1);
}

let bundledHtml = fs.readFileSync(distHtmlPath, 'utf8');

// Strip type="module" & crossorigin for maximum browser & GAS compatibility
bundledHtml = bundledHtml.replace(/<script type="module" crossorigin="">/g, '<script>');
bundledHtml = bundledHtml.replace(/<script type="module" crossorigin>/g, '<script>');
bundledHtml = bundledHtml.replace(/<script type="module">/g, '<script>');

// Ensure directories exist
const gasDir = path.join(rootDir, 'google-apps-script');
const publicGasDir = path.join(rootDir, 'public', 'gas-build');

if (!fs.existsSync(gasDir)) fs.mkdirSync(gasDir, { recursive: true });
if (!fs.existsSync(publicGasDir)) fs.mkdirSync(publicGasDir, { recursive: true });

// Save full standalone HTML (100% self-contained React app, NO AI Studio logo, NO external iframe!)
fs.writeFileSync(path.join(gasDir, 'Index.html'), bundledHtml, 'utf8');
fs.writeFileSync(path.join(gasDir, 'Page.html'), bundledHtml, 'utf8');
fs.writeFileSync(path.join(publicGasDir, 'Index.html'), bundledHtml, 'utf8');

// Copy Code.gs
const codeGsSource = path.join(gasDir, 'Code.gs');
if (fs.existsSync(codeGsSource)) {
  fs.copyFileSync(codeGsSource, path.join(publicGasDir, 'Code.gs'));
}

console.log('✅ Berhasil membuat berkas Standalone HTML murni (Tanpa Logo AI Studio!):');
console.log('   - /google-apps-script/Index.html');
console.log('   - /public/gas-build/Index.html');
