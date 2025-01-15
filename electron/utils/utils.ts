

// This module is used as a util functions for application interface between Electron application and operating system


export function getScreenResolution() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  return { width: screenWidth, height: screenHeight };
}

