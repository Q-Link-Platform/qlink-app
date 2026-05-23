const fs = require('fs');
const path = require('path');

// Check if favicon file exists and is readable
const faviconPath = 'public/favicon-original.svg';
const faviconPngPath = 'public/favicon-original.png';

console.log('🔍 DEBUGGING FAVICON ISSUE:');
console.log('=========================');

// Check SVG file
if (fs.existsSync(faviconPath)) {
  const stats = fs.statSync(faviconPath);
  console.log('✅ SVG file exists:', faviconPath);
  console.log('📁 File size:', stats.size, 'bytes');
  
  const content = fs.readFileSync(faviconPath, 'utf8');
  console.log('📝 Content preview:', content.substring(0, 100));
} else {
  console.log('❌ SVG file NOT found:', faviconPath);
}

// Check PNG file
if (fs.existsSync(faviconPngPath)) {
  const stats = fs.statSync(faviconPngPath);
  console.log('✅ PNG file exists:', faviconPngPath);
  console.log('📁 File size:', stats.size, 'bytes');
} else {
  console.log('❌ PNG file NOT found:', faviconPngPath);
}

// List all favicon files
console.log('\n📂 All favicon files in public:');
const files = fs.readdirSync('public').filter(f => f.includes('favicon'));
files.forEach(file => {
  const stats = fs.statSync(`public/${file}`);
  console.log(`   - ${file} (${stats.size} bytes)`);
});

console.log('\n🎯 SOLUTION: Create inline favicon directly in HTML');
