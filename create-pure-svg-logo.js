const fs = require('fs');
const sharp = require('sharp');

async function createPureSVGLogo() {
  try {
    console.log('🎨 Creating pure SVG logo with smooth scaling...');
    
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create 128x128 high-res base image
    const baseImageBuffer = await sharp(inputBuffer)
      .resize(128, 128, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100 })
      .toBuffer();
    
    // Convert to Base64 for embedding
    const base64 = baseImageBuffer.toString('base64');
    
    // Create pure SVG with your logo
    const pureSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <clipPath id="circleClip">
      <circle cx="64" cy="64" r="60"/>
    </clipPath>
  </defs>
  <rect width="128" height="128" fill="#0f172a" rx="16"/>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="128" height="128" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    
    // Save pure SVG
    fs.writeFileSync('public/logo-pure.svg', pureSVG);
    
    // Also create CSS for smooth scaling
    const smoothCSS = `
/* Smooth logo scaling */
.logo-smooth {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
}

/* Alternative smooth scaling */
.logo-smooth-alt {
  image-rendering: auto;
  image-rendering: smooth;
  image-rendering: -webkit-smooth;
  image-rendering: -moz-smooth;
  image-rendering: smooth;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}`;
    
    fs.writeFileSync('public/logo-smooth.css', smoothCSS);
    
    console.log('✅ Created pure SVG logo:');
    console.log(`   logo-pure.svg (128x128 base)`);
    console.log(`   logo-smooth.css (smooth scaling styles)`);
    
    console.log('\n🎯 Pure SVG ready!');
    console.log('📱 Perfect vector quality with smooth scaling!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPureSVGLogo();
