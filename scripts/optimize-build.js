import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');

// File size threshold for compression (10KB)
const COMPRESSION_THRESHOLD = 10 * 1024;

async function compressFile(filePath) {
  const content = await fs.readFile(filePath);
  
  if (content.length > COMPRESSION_THRESHOLD) {
    const compressed = await gzipAsync(content);
    await fs.writeFile(`${filePath}.gz`, compressed);
    console.log(`Compressed: ${path.basename(filePath)} (${content.length} → ${compressed.length} bytes)`);
  }
}

async function optimizeBuild() {
  console.log('🚀 Starting build optimization...');
  
  try {
    // Get all HTML, CSS, and JS files
    const files = await getAllFiles(distPath);
    const targetFiles = files.filter(file => 
      file.endsWith('.html') || 
      file.endsWith('.css') || 
      file.endsWith('.js')
    );
    
    // Compress files
    console.log(`\n📦 Compressing ${targetFiles.length} files...`);
    await Promise.all(targetFiles.map(compressFile));
    
    // Generate build report
    const report = await generateBuildReport(files);
    await fs.writeFile(
      path.join(distPath, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Build optimization complete!');
    console.log(`📊 Total size: ${formatBytes(report.totalSize)}`);
    console.log(`📁 Total files: ${report.fileCount}`);
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  }
}

async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
    })
  );
  return files.flat();
}

async function generateBuildReport(files) {
  const fileSizes = await Promise.all(
    files.map(async (file) => {
      const stats = await fs.stat(file);
      return {
        path: path.relative(distPath, file),
        size: stats.size,
        type: path.extname(file).slice(1) || 'other'
      };
    })
  );
  
  const byType = fileSizes.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = { count: 0, size: 0 };
    }
    acc[file.type].count++;
    acc[file.type].size += file.size;
    return acc;
  }, {});
  
  return {
    timestamp: new Date().toISOString(),
    fileCount: files.length,
    totalSize: fileSizes.reduce((sum, file) => sum + file.size, 0),
    byType,
    largestFiles: fileSizes
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(file => ({ ...file, size: formatBytes(file.size) }))
  };
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Run optimization
optimizeBuild();