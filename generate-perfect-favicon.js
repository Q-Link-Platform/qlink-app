const fs = require('fs');
const sharp = require('sharp');

async function generatePerfectFavicon() {
  try {
    // Read the circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Define sizes with padding (circle won't touch edges)
    const sizes = [
      { name: 'favicon-16x16', size: 16, padding: 2 },
      { name: 'favicon-32x32', size: 32, padding: 4 },
      { name: 'favicon-48x48', size: 48, padding: 6 }
    ];
    
    const buffers = [];
    
    for (const { name, size, padding } of sizes) {
      // Create canvas with padding
      const canvasSize = size;
      const circleSize = size - (padding * 2);
      const circlePos = padding;
      
      // Create SVG with centered circle and transparent padding
      const svg = `
        <svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-${size}">
              <circle cx="${canvasSize/2}" cy="${canvasSize/2}" r="${circleSize/2}"/>
            </clipPath>
          </defs>
          <image 
            href="/logo-circular.png" 
            x="${circlePos}" 
            y="${circlePos}" 
            width="${circleSize}" 
            height="${circleSize}" 
            clip-path="url(#circle-${size})"
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      `;
      
      // Generate PNG with padding
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      // Save individual PNG
      await sharp(pngBuffer)
        .toFile(`public/${name}.png`);
      
      buffers.push(pngBuffer);
      console.log(`✅ Generated ${name}.png (${size}x${size}, padding: ${padding}px)`);
    }
    
    // Create favicon.ico from the 32x32 version
    await sharp(buffers[1])
      .toFile('public/favicon.ico');
    
    // Create SVG favicon with perfect circle and padding
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <clipPath id="circle-clip">
            <circle cx="16" cy="16" r="12"/>
          </clipPath>
        </defs>
        <image 
          href="/logo-circular.png" 
          x="4" 
          y="4" 
          width="24" 
          height="24" 
          clip-path="url(#circle-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    `;
    
    fs.writeFileSync('public/favicon.svg', svgFavicon);
    
    console.log('🎯 Perfect favicon suite generated!');
    console.log('📁 Files created:');
    console.log('   - public/favicon.ico (multi-size)');
    console.log('   - public/favicon-16x16.png');
    console.log('   - public/favicon-32x32.png');
    console.log('   - public/favicon-48x48.png');
    console.log('   - public/favicon.svg');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generatePerfectFavicon();
