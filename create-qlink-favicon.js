const fs = require('fs');
const sharp = require('sharp');

async function createQLinkFavicon() {
  try {
    console.log('🚀 Creating Q-link Chat favicon...');
    
    // Read your Q-link Chat logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create perfect 32x32 favicon for browser tabs
    const faviconBuffer = await sharp(inputBuffer)
      .resize(32, 32, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        position: 'center'
      })
      .png()
      .toBuffer();
    
    console.log(`✅ Created 32x32 Q-link favicon (${faviconBuffer.length} bytes)`);
    
    // Convert to Base64 for inline embedding
    const base64 = faviconBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('🎯 Q-link Chat favicon ready!');
    console.log('📝 Base64 length:', base64.length);
    
    // Create HTML with your Q-link Chat favicon
    const htmlHead = `
<head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="${dataUrl}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</head>`;
    
    console.log('\n📋 HTML for Q-link Chat:');
    console.log(htmlHead);
    
    // Save favicon files
    fs.writeFileSync('public/favicon-qlink.png', faviconBuffer);
    console.log('✅ Saved Q-link favicon file');
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createQLinkFavicon();
