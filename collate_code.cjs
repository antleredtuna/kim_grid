const fs = require('fs');
const path = require('path');

// Configure which directories to exclude
const excludeDirs = ['archive', 'assets'];
// Configure which file extensions to include
const includeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html'];

// Function to recursively read directory
function processDirectory(dirPath, basePath) {
  const result = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    // If it's a directory and not in exclude list, process it
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        const subDirResults = processDirectory(itemPath, basePath);
        result.push(...subDirResults);
      }
    }
    // If it's a file with an extension we care about, process it
    else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (includeExtensions.includes(ext)) {
        try {
          const relativePath = path.relative(basePath, itemPath);
          const content = fs.readFileSync(itemPath, 'utf8');
          result.push({
            path: relativePath,
            content: content,
            extension: ext,
            lastModified: stat.mtime.toISOString()
          });
        } catch (error) {
          console.error(`Error reading file ${itemPath}:`, error);
        }
      }
    }
  }
  
  return result;
}

// Main execution
const srcPath = './src';
const baseDir = path.dirname(srcPath);
const files = processDirectory(srcPath, baseDir);

// Save to JSON file
const outputData = {
  collectedAt: new Date().toISOString(),
  totalFiles: files.length,
  files: files
};

fs.writeFileSync('source_code.json', JSON.stringify(outputData, null, 2));
console.log(`Processed ${files.length} files and saved to source_code.json`);
