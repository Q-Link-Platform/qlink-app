const sharp = require('sharp');
const fs = require('fs');

async function createProfessionalFavicon() {
    try {
        // Create perfect circular PNG with transparent background for favicon
        const circularFavicon = await sharp('public/logo.png')
            .resize(32, 32, { fit: 'cover', position: 'center' })
            .composite([{
                input: Buffer.from(
                    `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <mask id="circle">
                                <rect width="100%" height="100%" fill="white"/>
                                <circle cx="16" cy="16" r="14" fill="black"/>
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="transparent" mask="url(#circle)"/>
                    </svg>`
                ),
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        // Create ICO from circular PNG
        await sharp(circularFavicon)
            .toFile('public/favicon.ico');

        // Create multiple sizes for different platforms
        const sizes = [16, 32, 192, 512];
        
        for (const size of sizes) {
            await sharp('public/logo.png')
                .resize(size, size, { fit: 'cover', position: 'center' })
                .composite([{
                    input: Buffer.from(
                        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <mask id="circle${size}">
                                    <rect width="100%" height="100%" fill="white"/>
                                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="black"/>
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="transparent" mask="url(#circle${size})"/>
                        </svg>`
                    ),
                    blend: 'dest-in'
                }])
                .png()
                .toFile(`public/favicon-${size}.png`);
        }

        // Copy to all required locations
        fs.copyFileSync('public/favicon.ico', 'src/app/favicon.ico');
        fs.copyFileSync('public/favicon-32.png', 'public/favicon-32.png');
        fs.copyFileSync('public/favicon-192.png', 'public/apple-touch-icon.png');

        console.log('✅ Professional circular favicon set created!');
        console.log('Files: favicon.ico, favicon-16.png, favicon-32.png, favicon-192.png, apple-touch-icon.png');

    } catch (error) {
        console.error('Error:', error);
    }
}

createProfessionalFavicon();
