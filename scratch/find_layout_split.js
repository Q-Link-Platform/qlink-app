const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for main page grid/flex split:');
lines.forEach((line, index) => {
  if (line.includes('flex flex-col') || line.includes('grid grid-cols') || line.includes('min-h-screen') || line.includes('mx-auto') || line.includes('flex h-screen') || line.includes('max-w-')) {
    if (index > 4800 && index < 7000) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});
