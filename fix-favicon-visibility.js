const fs = require('fs');
const sharp = require('sharp');

async function fixFaviconVisibility() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Generate larger PNGs with minimal padding
    const sizes = [
      { name: 'favicon-16x16', size: 16, padding: 1 },
      { name: 'favicon-32x32', size: 32, padding: 1 },
      { name: 'favicon-48x48', size: 48, padding: 2 }
    ];
    
    for (const { name, size, padding } of sizes) {
      const circleSize = size - (padding * 2);
      
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${circleSize/2}"/>
            </clipPath>
          </defs>
          <image 
            href="/logo-circular.png" 
            x="${padding}" 
            y="${padding}" 
            width="${circleSize}" 
            height="${circleSize}" 
            clip-path="url(#circle-${size})"
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(`public/${name}.png`);
      
      console.log(`✅ Updated ${name}.png (${size}x${size}, padding: ${padding}px)`);
    }
    
    // Update favicon.ico from 32x32
    const buffer32x32 = await sharp('public/favicon-32x32.png').toBuffer();
    await sharp(buffer32x32).toFile('public/favicon.ico');
    
    // Update SVG with larger circle
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <clipPath id="circle-clip">
            <circle cx="16" cy="16" r="15"/>
          </clipPath>
        </defs>
        <image 
          href="/logo-circular.png" 
          x="1" 
          y="1" 
          width="30" 
          height="30" 
          clip-path="url(#circle-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    `;
    
    fs.writeFileSync('public/favicon.svg', svgFavicon);
    
    console.log('🎯 Favicon visibility fixed!');
    console.log('📁 Updated all favicon files with larger circles');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixFaviconVisibility();
