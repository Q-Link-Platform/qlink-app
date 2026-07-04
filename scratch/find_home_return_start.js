const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// The file ends with the closing of Home(), so let's scan backwards to see where the top-level return starts.
let braceCount = 0;
let returnLine = -1;

for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (line.includes('return (') && i > 500) {
    // Check if this return statement is the main one by seeing if it's not deeply indented
    const indent = line.search(/\S/);
    if (indent === 2 || indent === 4) { // typical indents for main return
      console.log(`Potential main return at Line ${i + 1} (indent ${indent}): ${line.trim()}`);
    }
  }
}
