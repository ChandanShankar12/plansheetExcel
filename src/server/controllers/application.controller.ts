import { Application } from '../models/application';

// Create a single application instance to be used throughout the app
const appInstance = new Application();
let initialized = false;

/**
 * Initialize the application
 */
export async function initializeApplication() {
  if (initialized) {
    console.log('[ApplicationController] Application already initialized');
    return appInstance;
  }
  
  console.log('[ApplicationController] Initializing application');
  await appInstance.initialize();
  initialized = true;
  return appInstance;
}

/**
 * Get the application instance
 */
export function getApplication() {
  if (!initialized) {
    console.warn('[ApplicationController] Application not initialized, initializing now');
    // Return the instance but also trigger initialization
    initializeApplication().catch(err => {
      console.error('[ApplicationController] Failed to initialize application:', err);
    });
  }
  return appInstance;
}

/**
 * Get application version
 */
export function getApplicationVersion() {
  return appInstance.version;
}

/**
 * Update application version
 */
export function updateApplicationVersion(version: string) {
  appInstance.version = version;
  return appInstance.version;
}

/**
 * Get company ID
 */
export function getCompanyId() {
  return appInstance.companyId;
}

/**
 * Get application state as JSON
 */
export function getApplicationState() {
  return appInstance.toJSON();
}

/**
 * Restore application from JSON data
 */
export function restoreApplicationState(data: any) {
  appInstance.fromJSON(data);
  return appInstance;
} 