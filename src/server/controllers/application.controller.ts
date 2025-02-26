import { Application } from '../models/application';
import { 
  initializeCache, 
  cacheApplicationState, 
  getApplicationState as getCachedAppState 
} from '../services/cache.service';

// Create a single application instance to be used throughout the app
const app = new Application();
let initialized = false;

/**
 * Initialize the application
 */
export async function initializeApplication() {
  if (initialized) {
    console.log('[ApplicationController] Application already initialized');
    return app;
  }
  
  console.log('[ApplicationController] Initializing application');
  
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
}

/**
 * Get the application instance
 */
export function getApplication() {
  if (!initialized) {
    console.log('[ApplicationController] Application not initialized, initializing now');
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
  return app.version;
}

/**
 * Update application version
 */
export function updateApplicationVersion(version: string) {
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
  return app.companyId;
}

/**
 * Get application state as JSON
 */
export function getApplicationState() {
  return app.toJSON();
}

/**
 * Restore application from JSON data
 */
export function restoreApplicationState(data: any) {
  app.fromJSON(data);
  // Cache the restored state
  cacheApplicationState(app.toJSON()).catch(err => {
    console.warn('[ApplicationController] Failed to cache restored state:', err);
  });
  return app;
} 