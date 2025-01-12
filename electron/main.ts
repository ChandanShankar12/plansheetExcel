import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'Xello',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
    },
  })

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    win.loadURL('http://localhost:3000')
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  
})