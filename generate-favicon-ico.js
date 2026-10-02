const fs = require('fs');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default || require('png-to-ico');

async function generateFaviconICO() {
  try {
    // Prepare multiple sizes for a proper ICO
    const sizes = [16, 32, 48];
    const buffers = [];

    for (const size of sizes) {
      const buffer = await sharp('public/logo.png')
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toBuffer();
      buffers.push(buffer);
    }

    // Generate multi-size ICO
    const icoBuffer = await pngToIco(buffers);

    // Write to public/favicon.ico and src/app/favicon.ico
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    fs.writeFileSync('src/app/favicon.ico', icoBuffer);

    console.log('✅ favicon.ico generated from logo.png');
    console.log('📁 Saved to: public/favicon.ico and src/app/favicon.ico');
  } catch (err) {
    console.error('❌ Error generating favicon.ico:', err);
  }
}

generateFaviconICO();
