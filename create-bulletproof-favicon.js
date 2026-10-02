const fs = require('fs');
const sharp = require('sharp');

async function createBulletproofFavicon() {
  try {
    console.log('🔧 Creating BULLETPROOF favicon...');
    
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create multiple sizes for maximum compatibility
    const sizes = [16, 32, 48];
    const buffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          position: 'center'
        })
        .png()
        .toBuffer();
      buffers.push(buffer);
      console.log(`✅ Created ${size}x${size} favicon (${buffer.length} bytes)`);
    }
    
    // Create ICO file with multiple sizes
    const pngToIco = require('png-to-ico');
    const icoBuffer = await pngToIco(buffers);
    fs.writeFileSync('public/favicon-bulletproof.ico', icoBuffer);
    console.log(`✅ Created ICO file (${icoBuffer.length} bytes)`);
    
    // Create simple SVG with embedded image
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <circle cx="16" cy="16" r="15" fill="none" stroke="transparent" stroke-width="2"/>
  <image href="/logo-circular.png" x="1" y="1" width="30" height="30" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
    
    fs.writeFileSync('public/favicon-bulletproof.svg', svgFavicon);
    console.log('✅ Created SVG file');
    
    // Create inline Base64 version (32x32)
    const base64Buffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const base64 = base64Buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('🎯 BULLETPROOF FAVICON READY!');
    console.log('📝 Base64 length:', base64.length);
    
    // Update HTML with bulletproof favicon setup
    const htmlHead = `
<head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="${dataUrl}" />
  <link rel="icon" href="/favicon-bulletproof.ico" />
  <link rel="icon" href="/favicon-bulletproof.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</head>`;
    
    console.log('\n📋 HTML to copy:');
    console.log(htmlHead);
    
    // Test file accessibility
    console.log('\n🔍 Testing file accessibility:');
    const files = ['favicon-bulletproof.ico', 'favicon-bulletproof.svg', 'logo-circular.png'];
    files.forEach(file => {
      if (fs.existsSync(`public/${file}`)) {
        const stats = fs.statSync(`public/${file}`);
        console.log(`✅ ${file} - ${stats.size} bytes`);
      } else {
        console.log(`❌ ${file} - NOT FOUND`);
      }
    });
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBulletproofFavicon();
