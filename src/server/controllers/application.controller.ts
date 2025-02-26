import { Application } from '../models/application';
import { 
  initializeCache, 
  cacheApplicationState, 
  getApplicationState as getCachedAppState 
} from '../services/cache.service';

// Use the singleton pattern instead of creating a new instance
let initialized = false;
let initializationInProgress = false;
let initializationPromise: Promise<Application> | null = null;

/**
 * Initialize the application
 */
export async function initializeApplication() {
  // Get the singleton instance
  const app = Application.getInstance();
  
  // If already initialized, return the app instance
  if (initialized) {
    console.log('[ApplicationController] Application already initialized');
    return app;
  }
  
  // If initialization is in progress, return the existing promise
  if (initializationInProgress && initializationPromise) {
    console.log('[ApplicationController] Initialization already in progress, waiting...');
    return initializationPromise;
  }
  
  console.log('[ApplicationController] Initializing application');
  initializationInProgress = true;
  
  // Create a new initialization promise
  initializationPromise = (async () => {
    try {
      // Initialize cache service first
      await initializeCache();
      
      // Try to restore from cache
      const cachedState = await getCachedAppState();
      if (cachedState) {
        console.log('[ApplicationController] Restoring from cached state');
        app.fromJSON(cachedState);
      } else {
        console.log('[ApplicationController] No cached state found, initializing with defaults');
        await app.initialize();
        
        // Cache the initial state
        try {
          await cacheApplicationState(app.toJSON());
        } catch (error) {
          console.warn('[ApplicationController] Failed to cache initial state:', error);
        }
      }
      
      initialized = true;
      return app;
    } finally {
      initializationInProgress = false;
    }
  })();
  
  return initializationPromise;
}

/**
 * Get the application instance
 */
export function getApplication() {
  const app = Application.getInstance();
  
  if (!initialized) {
    console.log('[ApplicationController] Application not initialized, initializing now');
    // Don't wait for initialization to complete, but start the process
    initializeApplication().catch(error => {
      console.error('[ApplicationController] Failed to initialize application:', error);
    });
  }
  return app;
}

/**
 * Get application version
 */
export function getApplicationVersion() {
  const app = Application.getInstance();
  return app.version;
}

/**
 * Update application version
 */
export function updateApplicationVersion(version: string) {
  const app = Application.getInstance();
  app.version = version;
  // Cache the updated state
  cacheApplicationState(app.toJSON()).catch(err => {
    console.warn('[ApplicationController] Failed to cache updated version:', err);
  });
  return app.version;
}

/**
 * Get company ID
 */
export function getCompanyId() {
  const app = Application.getInstance();
  return app.companyId;
}

/**
 * Get application state as JSON
 */
export function getApplicationState() {
  const app = Application.getInstance();
  return app.toJSON();
}

/**
 * Restore application from JSON data
 */
export function restoreApplicationState(data: any) {
  const app = Application.getInstance();
  app.fromJSON(data);
  // Cache the restored state
  cacheApplicationState(app.toJSON()).catch(err => {
    console.warn('[ApplicationController] Failed to cache restored state:', err);
  });
  return app;
} 