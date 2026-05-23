const fs = require('fs');
const sharp = require('sharp');

async function createBase64Favicon() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 32x32 favicon
    const faviconBuffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();
    
    // Convert to Base64
    const base64 = faviconBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    // Create SVG with Base64 embedded
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <defs>
          <clipPath id="circle">
            <circle cx="16" cy="16" r="16"/>
          </clipPath>
        </defs>
        <image 
          href="${dataUrl}" 
          x="0" 
          y="0" 
          width="32" 
          height="32" 
          clip-path="url(#circle)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    `;
    
    // Convert SVG to Base64
    const svgBase64 = Buffer.from(svgFavicon).toString('base64');
    const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    // Save the Base64 favicon
    fs.writeFileSync('public/favicon-base64.svg', svgFavicon);
    
    console.log('🎯 Base64 Favicon Created!');
    console.log('📝 Base64 length:', base64.length);
    console.log('📁 Saved: public/favicon-base64.svg');
    console.log('🔗 Data URL ready for HTML embedding');
    
    return svgDataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBase64Favicon();
