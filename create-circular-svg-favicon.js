const fs = require('fs');
const sharp = require('sharp');

async function createCircularSVGFavicon() {
  try {
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Resize to 32x32 and convert to Base64
    const resizedBuffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const base64 = resizedBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    // Create SVG with circular clipping and transparent edges
    const svgFavicon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <clipPath id="circle">
      <circle cx="16" cy="16" r="15"/>
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
</svg>`;
    
    // Convert SVG to Base64
    const svgBase64 = Buffer.from(svgFavicon).toString('base64');
    const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    console.log('🎯 CIRCULAR SVG FAVICON READY!');
    console.log('✅ Transparent edges applied');
    console.log('✅ Perfect circular clipping');
    console.log('📝 SVG Base64 length:', svgBase64.length);
    
    // Create HTML with circular SVG favicon
    const htmlHead = `
<head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="${svgDataUrl}" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</head>`;
    
    console.log('\n📋 HTML to copy:');
    console.log(htmlHead);
    
    return svgDataUrl;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createCircularSVGFavicon();
