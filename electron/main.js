const { app, BrowserWindow } = require("electron");
const path = require("path");
const { uIOhook } = require("uiohook-napi");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();

  uIOhook.on("keydown", (event) => {
    if (win) {
      win.webContents.send("key-event", {
        keycode: event.keycode,
        time: Date.now()
      });
    }
  });

  uIOhook.start();
});