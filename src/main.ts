import { app, BrowserWindow, globalShortcut, clipboard, Tray, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Create tray icon
  const tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('My Electron App');
  tray.setContextMenu(contextMenu);

  // Handle minimize event
  mainWindow.on('minimize', () => {
    mainWindow.hide();
  });

  // Handle tray icon click event
  tray.on('click', () => {
    mainWindow.show();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

const GLOBAL_SHORTCUT = 'CommandOrControl+Shift+Space';

app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register(GLOBAL_SHORTCUT, () => {
    console.log(GLOBAL_SHORTCUT + ' is pressed')
    mainWindow?.show();
    mainWindow?.reload();
  })

  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered(GLOBAL_SHORTCUT))
})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister(GLOBAL_SHORTCUT)

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
