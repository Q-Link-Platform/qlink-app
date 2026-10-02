const fs = require('fs');
const sharp = require('sharp');

async function createMaximumFavicon() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create favicon that fills entire space (no padding)
    const sizes = [16, 32, 48];
    
    for (const size of sizes) {
      // Create SVG that fills entire canvas
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>
            </clipPath>
          </defs>
          <image 
            href="/logo-circular.png" 
            x="0" 
            y="0" 
            width="${size}" 
            height="${size}" 
            clip-path="url(#circle-${size})"
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(`public/favicon-${size}x${size}.png`);
      
      console.log(`✅ Created favicon-${size}x${size}.png (full size)`);
    }
    
    // Create favicon.ico from 32x32
    await sharp('public/favicon-32x32.png')
      .toFile('public/favicon.ico');
    
    // Create SVG that fills entire space
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <clipPath id="circle-clip">
            <circle cx="16" cy="16" r="16"/>
          </clipPath>
        </defs>
        <image 
          href="/logo-circular.png" 
          x="0" 
          y="0" 
          width="32" 
          height="32" 
          clip-path="url(#circle-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    `;
    
    fs.writeFileSync('public/favicon.svg', svgFavicon);
    
    console.log('🎯 Maximum size favicon created!');
    console.log('📁 All files now fill entire favicon space');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMaximumFavicon();
