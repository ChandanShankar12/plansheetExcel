import { Application } from '@/server/models/application';

// Singleton instance of the application
let appInstance: Application | null = null;

/**
 * Initialize the application
 */
export async function initializeApp(): Promise<Application> {
  if (!appInstance) {
    try {
      // Initialize from API
      const response = await fetch('/api/init');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize application');
      }
      
      // Create application instance
      appInstance = await Application.initialize();
    } catch (error) {
      console.error('[AppInstance] Failed to initialize:', error);
      // Create default application
      appInstance = await Application.initialize();
    }
  }
  
  return appInstance;
}

/**
 * Get the application instance
 */
export function getAppInstance(): Application {
  if (!appInstance) {
    throw new Error('Application not initialized. Call initializeApp() first.');
  }
  
  return appInstance;
} 