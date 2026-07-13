
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'app/data/site_settings.json');

export const DEFAULT_SETTINGS = {
    showAuthLinks: true
};

export async function getSettings() {
    try {
        try {
            await fs.access(SETTINGS_FILE_PATH);
        } catch {
            return DEFAULT_SETTINGS;
        }

        const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return { ...DEFAULT_SETTINGS, ...data };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(settings: { showAuthLinks?: boolean }) {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
}
