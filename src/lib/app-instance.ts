import { Application } from '@/server/models/application';

// Create singleton instance outside of React's render cycle
let appInstance: Application | null = null;

export async function initializeApp() {
  if (!appInstance) {
    console.log('[AppInstance] Initializing application');
    appInstance = await Application.initialize();
  }
  return appInstance;
}

export function getAppInstance() {
  if (!appInstance) {
    console.warn('[AppInstance] Getting instance before initialization');
    appInstance = Application.instance;
  }
  return appInstance;
} 