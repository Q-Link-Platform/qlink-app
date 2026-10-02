const sharp = require('sharp');
const fs = require('fs');

async function createCircularICO() {
    try {
        // Create circular PNG first
        const circularPNG = await sharp('public/logo-circular.png')
            .resize(32, 32, { fit: 'cover', position: 'center' })
            .png()
            .toBuffer();

        // Create ICO with circular image
        await sharp(circularPNG)
            .toFile('public/favicon-circular.ico');

        // Replace the original favicon.ico
        fs.copyFileSync('public/favicon-circular.ico', 'src/app/favicon.ico');
        fs.copyFileSync('public/favicon-circular.ico', 'public/favicon.ico');

        console.log('✅ Circular ICO created successfully!');
        console.log('Files updated: favicon.ico (circular)');

    } catch (error) {
        console.error('Error:', error);
    }
}

createCircularICO();
