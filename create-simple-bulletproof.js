const fs = require('fs');
const sharp = require('sharp');

async function createSimpleBulletproof() {
  try {
    console.log('🔧 Creating SIMPLE BULLETPROOF favicon...');
    
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 32x32 favicon with padding
    const faviconBuffer = await sharp(inputBuffer)
      .resize(28, 28, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    console.log(`✅ Created 32x32 favicon (${faviconBuffer.length} bytes)`);
    
    // Convert to Base64
    const base64 = faviconBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('🎯 SIMPLE BULLETPROOF FAVICON READY!');
    console.log('📝 Base64 length:', base64.length);
    
    // Create HTML with inline favicon
    const htmlHead = `
<head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="${dataUrl}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</head>`;
    
    console.log('\n📋 HTML to copy:');
    console.log(htmlHead);
    
    // Save favicon file as backup
    fs.writeFileSync('public/favicon-simple-bulletproof.png', faviconBuffer);
    console.log('✅ Saved backup favicon file');
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createSimpleBulletproof();
