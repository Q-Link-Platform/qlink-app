const fs = require('fs');
const sharp = require('sharp');

async function createNoBlurLogo() {
  try {
    console.log('🎯 Creating NO-BLUR logo with different techniques...');
    
    // Read your high-quality image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // Get image info
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📏 Original: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    // TECHNIQUE 1: Use nearest neighbor for pixel-perfect scaling
    const pixelPerfect = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.nearest // No blur, pixel perfect
      })
      .png({ 
        quality: 100,
        compressionLevel: 0,
        adaptiveFiltering: false
      })
      .toBuffer();
    
    // TECHNIQUE 2: Use cubic with no sharpening
    const cubicNoSharpen = await sharp(inputBuffer)
      .resize(64, 64, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.cubic
      })
      .png({ 
        quality: 100,
        compressionLevel: 0,
        adaptiveFiltering: false
      })
      .toBuffer();
    
    // TECHNIQUE 3: Use original size and let CSS scale
    const originalSize = await sharp(inputBuffer)
      .resize(128, 128, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .png({ 
        quality: 100,
        compressionLevel: 0
      })
      .toBuffer();
    
    // TECHNIQUE 4: Create pure text-based logo as backup
    const textLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a" rx="12"/>
  <circle cx="32" cy="32" r="28" fill="none" stroke="#0ea5e9" stroke-width="2"/>
  <text x="32" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#0ea5e9" text-anchor="middle">Q</text>
</svg>`;
    
    // Save all versions
    fs.writeFileSync('public/logo-pixel-perfect.png', pixelPerfect);
    fs.writeFileSync('public/logo-cubic-no-sharpen.png', cubicNoSharpen);
    fs.writeFileSync('public/logo-original-size.png', originalSize);
    fs.writeFileSync('public/logo-text-backup.svg', textLogo);
    
    console.log('✅ NO-BLUR logo versions created:');
    console.log(`   logo-pixel-perfect.png (nearest neighbor) - ${pixelPerfect.length} bytes`);
    console.log(`   logo-cubic-no-sharpen.png (cubic, no sharpen) - ${cubicNoSharpen.length} bytes`);
    console.log(`   logo-original-size.png (128x128, CSS scaled) - ${originalSize.length} bytes`);
    console.log(`   logo-text-backup.svg (text-based fallback)`);
    
    console.log('\n🎯 NO-BLUR techniques ready!');
    console.log('📱 Try each one to see which works best!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createNoBlurLogo();
