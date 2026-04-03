const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onKeyEvent: (callback) => ipcRenderer.on("key-event", callback)
});