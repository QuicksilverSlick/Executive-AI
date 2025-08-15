#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Worker import paths...');

const workerDir = path.join(__dirname, '..', 'dist', '_worker.js');

// Files that might contain incorrect import paths
const filesToFix = [
  'index.js',
  'manifest_DJyh0bqO.mjs',
  'manifest_DSCDDGWt.mjs',
  'manifest_DE7QIW7o.mjs',
  // Add a wildcard pattern for any manifest file
];

// Also find all manifest files dynamically
try {
  const files = fs.readdirSync(workerDir);
  files.forEach(file => {
    if (file.startsWith('manifest_') && file.endsWith('.mjs')) {
      if (!filesToFix.includes(file)) {
        filesToFix.push(file);
      }
    }
  });
} catch (err) {
  console.log('Could not read worker directory:', err.message);
}

let fixedCount = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(workerDir, fileName);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Fix imports from "./_assets/" to "../_assets/"
      content = content.replace(/from"\.?\/_assets\//g, 'from"../_assets/');
      content = content.replace(/from'\.?\/_assets\//g, 'from\'../_assets/');
      content = content.replace(/from\s+"\.?\/_assets\//g, 'from "../_assets/');
      content = content.replace(/from\s+'\.?\/_assets\//g, 'from \'../_assets/');
      
      // Also fix import() statements
      content = content.replace(/import\("\.?\/_assets\//g, 'import("../_assets/');
      content = content.replace(/import\('\.?\/_assets\//g, 'import(\'../_assets/');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed imports in ${fileName}`);
        fixedCount++;
      }
    }
  } catch (err) {
    console.log(`⚠️ Could not process ${fileName}:`, err.message);
  }
});

console.log(`\n🎯 Import path fixing complete! Fixed ${fixedCount} files.`);