import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = '../data';
const allowedFilenames = ['shopping-list.json', 'recipe-list.json']

export async function POST({ request }) {
    try {
        const { filename, content } = await request.json();
        if (!allowedFilenames.includes(filename)) {
            return json({ error: 'Filename not allowed' }, { status: 400 });
        }
        await fs.writeFile(
            path.join(DATA_DIR, filename),
            JSON.stringify(content)
        );
        console.log('Data written to file:', filename, content);
        return json({ success: true });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

export async function GET({ url }) {
    const filename = url.searchParams.get('filename');
    if (!filename) {
        return json({ error: 'Filename is required' }, { status: 400 });
    }
    if (!allowedFilenames.includes(filename)) {
        return json({ error: 'Filename not allowed' }, { status: 400 });
    }
    try {
        const content = await fs.readFile(
            path.join(DATA_DIR, filename),
            'utf-8'
        );
        return json(JSON.parse(content));
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}