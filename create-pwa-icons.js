const fs = require('fs');
const sharp = require('sharp');

async function createPWAIcons() {
  try {
    console.log('📱 Creating PWA icons for Q-link Chat...');
    
    // Read your Q-link Chat logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create required PWA icon sizes
    const sizes = [
      { name: 'icon-72', size: 72 },
      { name: 'icon-96', size: 96 },
      { name: 'icon-128', size: 128 },
      { name: 'icon-144', size: 144 },
      { name: 'icon-152', size: 152 },
      { name: 'icon-192', size: 192 },
      { name: 'icon-384', size: 384 },
      { name: 'icon-512', size: 512 }
    ];
    
    for (const { name, size } of sizes) {
      const iconBuffer = await sharp(inputBuffer)
        .resize(size, size, { 
          fit: 'contain', 
          background: { r: 15, g: 23, b: 42, alpha: 1 }, // Dark blue background
          position: 'center'
        })
        .png()
        .toBuffer();
      
      fs.writeFileSync(`public/${name}.png`, iconBuffer);
      console.log(`✅ Created ${name}.png (${size}x${size}) - ${iconBuffer.length} bytes`);
    }
    
    // Create apple-touch-icon
    const appleIconBuffer = await sharp(inputBuffer)
      .resize(180, 180, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center'
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync('public/apple-touch-icon.png', appleIconBuffer);
    console.log(`✅ Created apple-touch-icon.png (180x180) - ${appleIconBuffer.length} bytes`);
    
    // Update manifest.json with all icons
    const manifest = {
      "name": "Q-link Chat | Quantum ID Messenger",
      "short_name": "Q-link Chat",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#0f172a",
      "theme_color": "#0ea5e9",
      "description": "Sci-fi inspired global chat where you connect via a single quantum ID.",
      "icons": [
        { "src": "/icon-72.png", "sizes": "72x72", "type": "image/png" },
        { "src": "/icon-96.png", "sizes": "96x96", "type": "image/png" },
        { "src": "/icon-128.png", "sizes": "128x128", "type": "image/png" },
        { "src": "/icon-144.png", "sizes": "144x144", "type": "image/png" },
        { "src": "/icon-152.png", "sizes": "152x152", "type": "image/png" },
        { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icon-384.png", "sizes": "384x384", "type": "image/png" },
        { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
      ]
    };
    
    fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ Updated manifest.json with all PWA icons');
    
    console.log('\n🎯 PWA Icons Ready!');
    console.log('📱 Install button should now be enabled!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPWAIcons();
