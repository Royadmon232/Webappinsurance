#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate timestamp-based version
const version = Date.now();
const indexPath = path.join(__dirname, 'index.html');

// Read index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the version parameter in script.js reference
indexContent = indexContent.replace(
    /script\.js\?v=[^"]+/g,
    `script.js?v=${version}`
);

// Write back to index.html
fs.writeFileSync(indexPath, indexContent);

console.log(`✅ Cache busting version updated to: ${version}`); 