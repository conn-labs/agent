import { readFile } from 'fs/promises';

export async function imgToBase64(image_file: string): Promise<string> {
    try {
        const data = await readFile(image_file);
        const base64Data = data.toString('base64');
        return `data:image/jpeg;base64,${base64Data}`;
    } catch (err) {
        console.error('Error reading the file:', err);
        throw err;
    }
}

