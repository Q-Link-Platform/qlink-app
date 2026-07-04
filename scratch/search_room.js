const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for "chatRoomId" occurrences:');
lines.forEach((line, index) => {
  if (line.includes('chatRoomId')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

console.log('\nSearching for "room:" occurrences:');
lines.forEach((line, index) => {
  if (line.includes('room:')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
