const fs = require('fs');
const sharp = require('sharp');

async function createPerfectCircularFavicon() {
  try {
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 32x32 favicon with transparent background and circular clipping
    const faviconBuffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    // Create circular mask
    const circularBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="16" cy="16" r="15" fill="white"/>' +
        '</svg>'
      ),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();
    
    // Apply circular mask to your logo
    const finalBuffer = await sharp(faviconBuffer)
      .composite([{
        input: circularBuffer,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    
    // Convert to Base64
    const base64 = finalBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('🎯 PERFECT CIRCULAR FAVICON READY!');
    console.log('📝 Base64 length:', base64.length);
    console.log('✅ Circular clipping applied');
    console.log('🔗 Data URL:', dataUrl.substring(0, 100) + '...');
    
    // Create HTML with perfect circular favicon
    const htmlHead = `
<head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="${dataUrl}" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</head>`;
    
    console.log('\n📋 HTML to copy:');
    console.log(htmlHead);
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPerfectCircularFavicon();
