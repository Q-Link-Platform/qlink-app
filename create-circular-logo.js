const fs = require('fs');
const path = require('path');

// Create a simple HTML file to generate circular logo
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: #1e293b; }
        .logo-container { 
            width: 200px; 
            height: 200px; 
            border-radius: 50%; 
            overflow: hidden; 
            border: 3px solid #0ea5e9;
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
        }
        .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .download-btn {
            margin: 20px 0;
            padding: 10px 20px;
            background: #0ea5e9;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h2 style="color: white;">Q-Link Circular Logo Generator</h2>
    <div class="logo-container">
        <img src="/logo.png" alt="Q-Link Logo" id="logoImg" />
    </div>
    <br>
    <button class="download-btn" onclick="downloadCircularLogo()">Download Circular Logo</button>
    
    <script>
        function downloadCircularLogo() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = 200;
            canvas.width = size;
            canvas.height = size;
            
            // Create circular clipping path
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            // Draw the image
            const img = document.getElementById('logoImg');
            ctx.drawImage(img, 0, 0, size, size);
            
            // Download the circular image
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'logo-circular.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'public', 'circular-logo.html'), htmlContent);
console.log('Circular logo generator created! Open http://localhost:3000/circular-logo.html');
