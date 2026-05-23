const sharp = require('sharp');
const fs = require('fs');

async function createCircularLogo() {
    try {
        await sharp('public/logo.png')
            .resize(200, 200, { fit: 'cover', position: 'center' })
            .composite([{
                input: Buffer.from(
                    '<svg width="200" height="200"><circle cx="100" cy="100" r="97" fill="none" stroke="#0ea5e9" stroke-width="3"/></svg>'
                ),
                top: 0,
                left: 0,
            }])
            .png()
            .toFile('public/logo-circular.png');
        
        console.log('Circular logo created successfully!');
        console.log('Replace logo.png with logo-circular.png');
    } catch (error) {
        console.log('Sharp not available, use the HTML method instead');
    }
}

createCircularLogo();
