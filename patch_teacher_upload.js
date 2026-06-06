const fs = require('fs');

const resizeFunc = `
    const resizeImage = (file, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (error) => reject(error);
        });
    };
`;

let content = fs.readFileSync('app/admin/teachers/page.tsx', 'utf8');

// Insert the resize func right inside the component before handleImageChange
if (!content.includes('resizeImage')) {
    content = content.replace('const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {', resizeFunc + '\n    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {');
    
    // Replace the upload part
    content = content.replace(`const formData = new FormData();\n            formData.append('file', file);`, `// Resize image to max 1200px before uploading to avoid Vercel 4.5MB limit
            const resizedFile = await resizeImage(file, 1200, 1200);
            const formData = new FormData();
            formData.append('file', resizedFile);`);
            
    fs.writeFileSync('app/admin/teachers/page.tsx', content);
    console.log("Teacher upload patched!");
}

let content2 = fs.readFileSync('app/admin/popups/page.tsx', 'utf8');

if (!content2.includes('resizeImage')) {
    content2 = content2.replace('const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {', resizeFunc + '\n    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {');
    
    // Replace the upload part
    content2 = content2.replace(`const formData = new FormData();\n            formData.append('file', file);`, `// Resize image to max 1200px before uploading to avoid Vercel 4.5MB limit
            const resizedFile = await resizeImage(file, 1200, 1200);
            const formData = new FormData();
            formData.append('file', resizedFile);`);
            
    fs.writeFileSync('app/admin/popups/page.tsx', content2);
    console.log("Popup upload patched!");
}

