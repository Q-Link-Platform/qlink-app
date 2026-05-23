const fs = require('fs');
const sharp = require('sharp');

async function createUIUXLogo() {
  try {
    console.log('🎨 Creating UI/UX optimized logo from high-quality image...');
    
    // Read your new high-quality image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // Get image info
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📏 Original image: ${metadata.width}x${metadata.height}, ${metadata.format}`);
    
    // Create UI/UX optimized versions using professional techniques
    
    // 1. Session Key version (32x32) - Perfect for small spaces
    const sessionKeyLogo = await sharp(inputBuffer)
      .resize(32, 32, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 }, // Dark blue background
        position: 'center',
        kernel: sharp.kernel.lanczos3 // Best quality for downscaling
      })
      .sharpen({ 
        sigma: 0.5, 
        flat: 1.5, 
        jagged: 2 
      }) // Professional sharpening for small sizes
      .modulate({ 
        brightness: 1.02, 
        saturation: 1.1 
      }) // Slight enhancement for visibility
      .png({ 
        quality: 100,
        compressionLevel: 6, // Balanced compression
        adaptiveFiltering: true
      })
      .toBuffer();
    
    // 2. Welcome Screen version (64x64) - Perfect for onboarding
    const welcomeLogo = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ 
        sigma: 0.3, 
        flat: 1, 
        jagged: 1 
      })
      .modulate({ 
        brightness: 1.01, 
        saturation: 1.05 
      })
      .png({ 
        quality: 100,
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toBuffer();
    
    // 3. General use version (64x64) - For all other locations
    const generalLogo = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ 
        sigma: 0.3, 
        flat: 1, 
        jagged: 1 
      })
      .png({ 
        quality: 100,
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toBuffer();
    
    // 4. High-res base for SVG (256x256) - For vector fallback
    const svgBase = await sharp(inputBuffer)
      .resize(256, 256, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .png({ 
        quality: 100,
        compressionLevel: 0 // No compression for base
      })
      .toBuffer();
    
    // Save all optimized versions
    fs.writeFileSync('public/logo-session-key-ui.png', sessionKeyLogo);
    fs.writeFileSync('public/logo-welcome-ui.png', welcomeLogo);
    fs.writeFileSync('public/logo-ui.png', generalLogo);
    
    // Create SVG with high-quality base
    const svgBase64 = svgBase.toString('base64');
    const uiSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <clipPath id="circleClip">
      <circle cx="128" cy="128" r="124"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#0f172a" rx="32"/>
  <image href="data:image/png;base64,${svgBase64}" x="0" y="0" width="256" height="256" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    
    fs.writeFileSync('public/logo-ui.svg', uiSVG);
    
    console.log('✅ UI/UX optimized logos created:');
    console.log(`   logo-session-key-ui.png (32x32) - ${sessionKeyLogo.length} bytes`);
    console.log(`   logo-welcome-ui.png (64x64) - ${welcomeLogo.length} bytes`);
    console.log(`   logo-ui.png (64x64) - ${generalLogo.length} bytes`);
    console.log(`   logo-ui.svg (256x256 vector)`);
    
    console.log('\n🎯 UI/UX optimized logos ready!');
    console.log('📱 Professional quality with perfect scaling!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUIUXLogo();
