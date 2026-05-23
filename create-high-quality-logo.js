const fs = require('fs');
const sharp = require('sharp');

async function createHighQualityLogo() {
  try {
    console.log('🎨 Creating high-quality logos for Q-link Chat...');
    
    // Read your original circular logo
    const inputBuffer = fs.readFileSync('public/logo-circular.png');
    
    // Create high-quality 32x32 for Session Key area
    const sessionKeyLogo = await sharp(inputBuffer)
      .resize(32, 32, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 }, // Dark blue background
        position: 'center',
        kernel: sharp.kernel.lanczos3 // High quality kernel
      })
      .sharpen({ sigma: 1, flat: 1, jagged: 2 }) // Sharpen for small size
      .png({ 
        quality: 100,
        compressionLevel: 0 // No compression for max quality
      })
      .toBuffer();
    
    // Create high-quality 64x64 for welcome screen
    const welcomeLogo = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.5, flat: 1, jagged: 1 })
      .png({ 
        quality: 100,
        compressionLevel: 0
      })
      .toBuffer();
    
    // Save high-quality logos
    fs.writeFileSync('public/logo-session-key.png', sessionKeyLogo);
    fs.writeFileSync('public/logo-welcome.png', welcomeLogo);
    
    // Also update main logo.png with better quality
    const mainLogo = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.5, flat: 1, jagged: 1 })
      .png({ 
        quality: 100,
        compressionLevel: 0
      })
      .toBuffer();
    
    fs.writeFileSync('public/logo.png', mainLogo);
    
    console.log('✅ Created high-quality logos:');
    console.log(`   logo-session-key.png (32x32) - ${sessionKeyLogo.length} bytes`);
    console.log(`   logo-welcome.png (64x64) - ${welcomeLogo.length} bytes`);
    console.log(`   logo.png (64x64) - ${mainLogo.length} bytes`);
    
    console.log('\n🎯 High-quality logos ready!');
    console.log('📱 Session Key logo should now be crystal clear!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createHighQualityLogo();
