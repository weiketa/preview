const electron = require('electron');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


let mainWindow;

let flashPath = app.getPath('pepperFlashSystemPlugin');
if(flashPath){
    app.commandLine.appendSwitch('ppapi-flash-path',flashPath);
}

function createWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL(`file://${__dirname}/main/index.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    require('./util/server').createServer();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/* ===============================热更新==================================start */
const {updateApp,startUpdate,restartApp} = require('./update');
const ipcMain = electron.ipcMain;

ipcMain.on('checkUpdate', (event,arg) => {
  switch(arg){
    case "check":
    updateApp(app.getVersion(),mainWindow,app);
    break;
    case "start":
    startUpdate();
    break;
    case "end":
    restartApp();
    break;
  }
})
/* ===============================热更新==================================end */