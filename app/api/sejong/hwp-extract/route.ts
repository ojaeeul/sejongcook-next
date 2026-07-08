import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export async function POST(req: Request) {
    let tempDir = '';
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempId = crypto.randomBytes(16).toString('hex');
        tempDir = path.join('/tmp', `hwp_${tempId}`);
        await fs.mkdir(tempDir, { recursive: true });
        
        const hwpPath = path.join(tempDir, 'input.hwp');
        const htmlOutDir = path.join(tempDir, 'output');
        
        await fs.writeFile(hwpPath, buffer);
        
        // Run hwp5html
        const hwp5htmlPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/hwp5html';
        try {
            await execAsync(`"${hwp5htmlPath}" --output "${htmlOutDir}" "${hwpPath}"`);
        } catch (e: any) {
            // Ignore errors if the output file was still generated
            console.warn('hwp5html execution warning:', e.message);
        }
        
        // Read index.xhtml
        const htmlPath = path.join(htmlOutDir, 'index.xhtml');
        let htmlContent = await fs.readFile(htmlPath, 'utf-8');
        
        // Inline images as Base64 to fix broken example boxes/images
        const bindataDir = path.join(htmlOutDir, 'bindata');
        try {
            const files = await fs.readdir(bindataDir);
            for (const file of files) {
                const filePath = path.join(bindataDir, file);
                const ext = path.extname(file).toLowerCase();
                let mimeType = 'image/png';
                if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.svg') mimeType = 'image/svg+xml';
                
                const fileData = await fs.readFile(filePath);
                const base64Data = fileData.toString('base64');
                const dataUri = `data:${mimeType};base64,${base64Data}`;
                
                // Replace both variants: "bindata/file" and "./bindata/file"
                const regex1 = new RegExp(`bindata/${file}`, 'g');
                const regex2 = new RegExp(`\\./bindata/${file}`, 'g');
                htmlContent = htmlContent.replace(regex2, dataUri).replace(regex1, dataUri);
            }
        } catch (e) {
            // Ignored if bindata does not exist
        }
        
        // Clean up immediately
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        
        // Extract body to reduce size and strip unnecessary headers
        let bodyContent = htmlContent;
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            bodyContent = bodyMatch[1];
        }

        // Return extracted HTML
        return NextResponse.json({ html: bodyContent });
    } catch (error: any) {
        if (tempDir) {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
        console.error('HWP extract error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
