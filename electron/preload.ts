import { contextBridge } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Add any electron APIs you want to expose to your Next.js app here
    platform: process.platform
  }
) 