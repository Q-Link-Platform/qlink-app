const fs = require('fs');
const sharp = require('sharp');

async function create2025Favicon() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 48x48 PNG fallback (2025 standard)
    const png48 = await sharp(inputBuffer)
      .resize(48, 48, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();
    
    fs.writeFileSync('public/favicon-48.png', png48);
    
    // Create SVG with proper viewBox and square canvas
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <defs>
          <clipPath id="circle">
            <circle cx="24" cy="24" r="24"/>
          </clipPath>
        </defs>
        <image 
          href="/logo-circular.png" 
          x="0" 
          y="0" 
          width="48" 
          height="48" 
          clip-path="url(#circle)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    `;
    
    fs.writeFileSync('public/favicon.svg', svgFavicon);
    
    console.log('🎯 2025 Bulletproof Favicon Created!');
    console.log('📁 Files:');
    console.log('   - public/favicon.svg (main for modern browsers)');
    console.log('   - public/favicon-48.png (fallback)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

create2025Favicon();
