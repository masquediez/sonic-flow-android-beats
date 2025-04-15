
import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running in a web browser (not in a native app)
 */
export const isWebBrowser = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Check if the app is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if the app is running in a web browser in development mode
 */
export const isWebDevelopment = (): boolean => {
  return isWebBrowser() && isDevelopmentMode();
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};
