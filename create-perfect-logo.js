const fs = require('fs');
const sharp = require('sharp');

async function createPerfectLogo() {
  try {
    console.log('🎯 Creating PERFECT LOGO - ChatGPT Steps...');
    
    // Read original 1024×1536 image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // STEP 1: Proper Square Crop (1024×1024)
    // Center se 1024×1024 crop karo, Q symbol center me
    const squareLogo = await sharp(inputBuffer)
      .extract({
        left: 0, // Start from left
        top: Math.floor((1536 - 1024) / 2), // Center vertically: (1536-1024)/2 = 256
        width: 1024,
        height: 1024
      })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    // Save square version
    fs.writeFileSync('public/logo-square.png', squareLogo);
    console.log('✅ STEP 1: Square crop done - logo-square.png (1024×1024)');
    
    // STEP 2: High Quality Resize Versions
    
    // 256×256 version
    const logo256 = await sharp(squareLogo)
      .resize(256, 256, { 
        fit: 'cover',
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    // 128×128 version  
    const logo128 = await sharp(squareLogo)
      .resize(128, 128, { 
        fit: 'cover',
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    
    // Save all versions
    fs.writeFileSync('public/logo-256.png', logo256);
    fs.writeFileSync('public/logo-128.png', logo128);
    
    console.log('✅ STEP 2: High quality versions created:');
    console.log(`   logo-256.png (256×256) - ${logo256.length} bytes`);
    console.log(`   logo-128.png (128×128) - ${logo128.length} bytes`);
    
    // STEP 3: Create optimized versions for specific sizes
    // 32px version using 256px source (oversampling)
    const logo32 = await sharp(logo256)
      .resize(32, 32, { 
        fit: 'cover',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.3, flat: 1, jagged: 1 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // 64px version using 256px source (oversampling)
    const logo64 = await sharp(logo256)
      .resize(64, 64, { 
        fit: 'cover',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.2, flat: 0.8, jagged: 0.8 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    fs.writeFileSync('public/logo-32.png', logo32);
    fs.writeFileSync('public/logo-64.png', logo64);
    
    console.log('✅ STEP 3: Optimized display versions:');
    console.log(`   logo-32.png (32×32) - ${logo32.length} bytes`);
    console.log(`   logo-64.png (64×64) - ${logo64.length} bytes`);
    
    console.log('\n🎯 PERFECT LOGO READY!');
    console.log('📱 ChatGPT Steps Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPerfectLogo();
