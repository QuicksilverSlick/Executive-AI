#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Worker import paths...');

const distDir = path.join(__dirname, '..', 'dist');

// Find the worker file (either _worker.js or worker.js)
let workerFile = null;
if (fs.existsSync(path.join(distDir, '_worker.js'))) {
  workerFile = '_worker.js';
} else if (fs.existsSync(path.join(distDir, 'worker.js'))) {
  workerFile = 'worker.js';
} else {
  console.log('❌ No worker file found!');
  process.exit(1);
}

// Get ALL .js and .mjs files in the dist directory
let filesToFix = [workerFile];
try {
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    // Process all .js and .mjs files except the worker file we already added
    if ((file.endsWith('.js') || file.endsWith('.mjs')) && file !== workerFile) {
      filesToFix.push(file);
    }
  });
} catch (err) {
  console.log('Could not read dist directory:', err.message);
}

let fixedCount = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(distDir, fileName);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Fix imports from "./_assets/" to "../_assets/"
      content = content.replace(/from"\.?\/_assets\//g, 'from"../_assets/');
      content = content.replace(/from'\.?\/_assets\//g, 'from\'../_assets/');
      content = content.replace(/from\s+"\.?\/_assets\//g, 'from "../_assets/');
      content = content.replace(/from\s+'\.?\/_assets\//g, 'from \'../_assets/');
      
      // Fix imports without slash prefix
      content = content.replace(/from"_assets\//g, 'from"../_assets/');
      content = content.replace(/from'_assets\//g, 'from\'../_assets/');
      content = content.replace(/from\s+"_assets\//g, 'from "../_assets/');
      content = content.replace(/from\s+'_assets\//g, 'from \'../_assets/');
      
      // Also fix import() statements
      content = content.replace(/import\("\.?\/_assets\//g, 'import("../_assets/');
      content = content.replace(/import\('\.?\/_assets\//g, 'import(\'../_assets/');
      content = content.replace(/import\("_assets\//g, 'import("../_assets/');
      content = content.replace(/import\('_assets\//g, 'import(\'../_assets/');
      
      // Fix module imports in error messages or strings that might be used
      content = content.replace(/No such module "_assets\//g, 'No such module "../_assets/');
      content = content.replace(/imported from "_assets\//g, 'imported from "../_assets/');
      
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