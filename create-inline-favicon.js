const fs = require('fs');
const sharp = require('sharp');

async function createInlineFavicon() {
  try {
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 32x32 favicon
    const faviconBuffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();
    
    // Convert to Base64
    const base64 = faviconBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('🎯 INLINE FAVICON READY!');
    console.log('📝 Base64 length:', base64.length);
    console.log('🔗 Data URL:', dataUrl.substring(0, 100) + '...');
    
    // Create HTML with inline favicon
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

createInlineFavicon();
