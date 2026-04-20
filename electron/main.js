import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        titleBarStyle: 'hiddenInset',
        icon: path.join(__dirname, '..', 'public', 'icon.png'),
    });

    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
}

ipcMain.handle('save-file', async (event, { buffer, filename }) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename
    });

    if (filePath) {
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return { success: true, path: filePath };
    }

    return { success: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});