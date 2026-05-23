const fs = require('fs');
const path = require('path');

async function convertPngToIco() {
  try {
    const sharp = require('sharp');
    
    // Read the source PNG
    const inputBuffer = fs.readFileSync('public/logo.png');
    
    // Create different sizes for ICO
    const sizes = [
      { size: 16, name: 'favicon-16' },
      { size: 32, name: 'favicon-32' },
      { size: 48, name: 'favicon-48' }
    ];
    
    const buffers = [];
    
    for (const { size, name } of sizes) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size, { 
          fit: 'cover', 
          position: 'center',
          background: { r: 15, g: 23, b: 42, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      buffers.push(buffer);
      console.log(`✅ Generated ${name}.png (${size}x${size})`);
    }
    
    // Create a simple ICO using the 32x32 version
    const icoBuffer = buffers[1]; // Use 32x32 as primary
    
    // Save ICO files
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    fs.writeFileSync('src/app/favicon.ico', icoBuffer);
    
    // Also save individual PNGs
    fs.writeFileSync('public/favicon-16.png', buffers[0]);
    fs.writeFileSync('public/favicon-32.png', buffers[1]);
    fs.writeFileSync('public/favicon-48.png', buffers[2]);
    
    console.log('🎯 Perfect ICO conversion complete!');
    console.log('📁 Files saved:');
    console.log('   - public/favicon.ico (main)');
    console.log('   - src/app/favicon.ico (Next.js)');
    console.log('   - public/favicon-16.png');
    console.log('   - public/favicon-32.png');
    console.log('   - public/favicon-48.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

convertPngToIco();
