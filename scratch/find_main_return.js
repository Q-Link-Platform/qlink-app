const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for "export default function" occurrences:');
lines.forEach((line, index) => {
  if (line.includes('export default function')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
