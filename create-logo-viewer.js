const fs = require('fs');
const sharp = require('sharp');

async function createLogoViewer() {
  try {
    console.log('🖼️ Creating logo viewer assets...');
    
    // Read your high-quality image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // Create high-res version for viewer (512x512)
    const viewerLogo = await sharp(inputBuffer)
      .resize(512, 512, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.2, flat: 0.5, jagged: 0.8 })
      .png({ 
        quality: 100,
        compressionLevel: 0 // No compression for viewer
      })
      .toBuffer();
    
    // Create ultra-high-res version (1024x1024)
    const ultraHighRes = await sharp(inputBuffer)
      .resize(1024, 1024, { 
        fit: 'contain', 
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .png({ 
        quality: 100,
        compressionLevel: 0
      })
      .toBuffer();
    
    // Save viewer assets
    fs.writeFileSync('public/logo-viewer-hd.png', viewerLogo);
    fs.writeFileSync('public/logo-viewer-ultra-hd.png', ultraHighRes);
    
    console.log('✅ Logo viewer assets created:');
    console.log(`   logo-viewer-hd.png (512x512) - ${viewerLogo.length} bytes`);
    console.log(`   logo-viewer-ultra-hd.png (1024x1024) - ${ultraHighRes.length} bytes`);
    
    console.log('\n🖼️ Logo viewer ready!');
    console.log('📱 Perfect quality image viewer!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLogoViewer();
