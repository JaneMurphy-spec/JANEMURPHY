const fs = require('fs');
const path = require('path');

function copyToDir(dirName) {
  const targetDir = path.join(__dirname, dirName);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const ignored = [
    'node_modules',
    '.git',
    'dist',
    'public',
    'api',
    'server.js',
    'serve-local.js',
    'build.js',
    'bun.lock',
    'vercel.json',
    'metadata.json',
    '.env',
    '.env.example'
  ];

  const items = fs.readdirSync(__dirname);
  for (const item of items) {
    if (ignored.includes(item)) {
      continue;
    }
    const srcPath = path.join(__dirname, item);
    const destPath = path.join(targetDir, item);
    try {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } catch (err) {
      console.warn(`Could not copy ${item}:`, err.message);
    }
  }
}

copyToDir('dist');
copyToDir('public');

console.log('Build succeeded: Static files copied to dist/ and public/');
