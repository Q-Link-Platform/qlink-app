const fs = require('fs');
const sharp = require('sharp');

async function makeCircularICO() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create circular versions for different sizes
    const sizes = [16, 32, 48];
    const buffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toBuffer();
      
      buffers.push(buffer);
      console.log(`✅ Created circular ${size}x${size}`);
    }
    
    // Create ICO from circular images
    await sharp(buffers[1]) // Use 32x32 as primary
      .toFile('public/favicon-circular.ico');
    
    // Copy to all locations
    fs.copyFileSync('public/favicon-circular.ico', 'public/favicon.ico');
    fs.copyFileSync('public/favicon-circular.ico', 'src/app/favicon.ico');
    
    // Clean up old files
    const filesToDelete = [
      'public/favicon-16.png',
      'public/favicon-32.png', 
      'public/favicon-48.png',
      'public/temp-logo.png'
    ];
    
    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️ Deleted ${file}`);
      }
    });
    
    console.log('🎯 Circular ICO created and set perfectly!');
    console.log('📁 Files: public/favicon.ico, src/app/favicon.ico');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeCircularICO();
