import dayjs from 'dayjs';

// This module is used as a util functions for application interface between application and operating system

export function greetingAccordingToTime() {
  const hour = dayjs().hour();
  const greetings = {
    morning: `Good Morning`,
    afternoon: `Good Afternoon`,
    evening: `Good Evening`,
    night: `Good Night`,
  };

  if (hour >= 5 && hour < 12) {
    return greetings.morning;
  } else if (hour >= 12 && hour < 17) {
    return greetings.afternoon;
  } else if (hour >= 17 && hour < 22) {
    return greetings.evening;
  } else {
    return greetings.night;
  }
}


export function getScreenResolution() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  return { width: screenWidth, height: screenHeight };
}
