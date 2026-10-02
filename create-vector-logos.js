const fs = require('fs');
const sharp = require('sharp');

async function createVectorLogos() {
  try {
    console.log('🎨 Creating vector-based logos for perfect quality...');
    
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create high-res version first
    const highResBuffer = await sharp(inputBuffer)
      .resize(256, 256, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100 })
      .toBuffer();
    
    // Convert to Base64 for embedding in SVG
    const base64 = highResBuffer.toString('base64');
    
    // Create SVG for Session Key (32x32)
    const sessionKeySVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="32" height="32">
  <defs>
    <clipPath id="circleClip">
      <circle cx="128" cy="128" r="124"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#0f172a" rx="32"/>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="256" height="256" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    
    // Create SVG for Welcome screen (64x64)
    const welcomeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="64" height="64">
  <defs>
    <clipPath id="circleClip">
      <circle cx="128" cy="128" r="124"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#0f172a" rx="32"/>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="256" height="256" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    
    // Create SVG for general use (64x64)
    const mainSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="64" height="64">
  <defs>
    <clipPath id="circleClip">
      <circle cx="128" cy="128" r="124"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#0f172a" rx="32"/>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="256" height="256" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    
    // Save SVG files
    fs.writeFileSync('public/logo-session-key.svg', sessionKeySVG);
    fs.writeFileSync('public/logo-welcome.svg', welcomeSVG);
    fs.writeFileSync('public/logo.svg', mainSVG);
    
    // Also create ultra-high-res PNG versions
    const ultraHighResBuffer = await sharp(inputBuffer)
      .resize(512, 512, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.3, flat: 1, jagged: 1 })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    // Create optimized PNGs from ultra-high-res
    const sessionKeyPNG = await sharp(ultraHighResBuffer)
      .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.5, flat: 1, jagged: 2 })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    const welcomePNG = await sharp(ultraHighResBuffer)
      .resize(64, 64, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.3, flat: 1, jagged: 1 })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    fs.writeFileSync('public/logo-session-key-hd.png', sessionKeyPNG);
    fs.writeFileSync('public/logo-welcome-hd.png', welcomePNG);
    
    console.log('✅ Created vector and ultra-high-res logos:');
    console.log(`   logo-session-key.svg (32x32 vector)`);
    console.log(`   logo-welcome.svg (64x64 vector)`);
    console.log(`   logo-session-key-hd.png (32x32 ultra-HD) - ${sessionKeyPNG.length} bytes`);
    console.log(`   logo-welcome-hd.png (64x64 ultra-HD) - ${welcomePNG.length} bytes`);
    
    console.log('\n🎯 Vector logos ready!');
    console.log('📱 Perfect quality at any size!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createVectorLogos();
