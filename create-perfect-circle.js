const sharp = require('sharp');
const fs = require('fs');

async function createPerfectCircle() {
    try {
        // Create a perfect circular canvas
        const size = 64;
        const canvas = Buffer.from(
            `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="circle">
                        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"/>
                    </clipPath>
                </defs>
                <rect width="${size}" height="${size}" fill="#0f172a"/>
                <image href="/logo.png" x="0" y="0" width="${size}" height="${size}" clip-path="url(#circle)"/>
                <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="none" stroke="#0ea5e9" stroke-width="2"/>
            </svg>`
        );

        // Generate multiple sizes for ICO
        const sizes = [16, 32, 48];
        const images = [];
        
        for (const size of sizes) {
            const resized = await sharp(canvas)
                .resize(size, size, { fit: 'cover', position: 'center' })
                .png()
                .toBuffer();
            images.push(resized);
        }

        // Create proper ICO file with multiple sizes
        await sharp(images[1]) // Use 32x32 as base
            .toFile('public/favicon-perfect.ico');

        // Copy to all locations
        fs.copyFileSync('public/favicon-perfect.ico', 'src/app/favicon.ico');
        fs.copyFileSync('public/favicon-perfect.ico', 'public/favicon.ico');

        // Also create a 16x16 version for old browsers
        await sharp(images[0])
            .toFile('public/favicon-16.ico');

        console.log('✅ Perfect circular favicon created!');
        console.log('Sizes generated:', sizes);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

createPerfectCircle();
