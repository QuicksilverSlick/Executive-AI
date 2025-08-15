#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Worker import paths...');

const workerDir = path.join(__dirname, '..', 'dist', '_worker.js');

// Get ALL files in the worker directory
let filesToFix = [];
try {
  const files = fs.readdirSync(workerDir);
  files.forEach(file => {
    // Process all .js and .mjs files
    if (file.endsWith('.js') || file.endsWith('.mjs')) {
      filesToFix.push(file);
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