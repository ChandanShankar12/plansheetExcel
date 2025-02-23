import { Application } from '@/server/models/application';

// Create singleton instance outside of React's render cycle
let appInstance: Application | null = null;

export function getAppInstance() {
  if (!appInstance) {
    console.log('[AppInstance] Creating initial application instance');
    appInstance = Application.instance;
  } else {
    console.log('[AppInstance] Reusing existing application instance');
  }
  return appInstance;
} 