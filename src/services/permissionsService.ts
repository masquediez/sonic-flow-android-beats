
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { Permissions } from '@capacitor/core';

/**
 * Service for handling native device permissions
 */
export class PermissionsService {
  private isAndroid = Capacitor.getPlatform() === 'android';
  
  /**
   * Request storage permissions for Android devices
   */
  public async requestStoragePermissions(): Promise<boolean> {
    if (!this.isAndroid) {
      return true;
    }
    
    try {
      // First, check if we already have permissions
      const hasPermission = await this.checkStoragePermissions();
      if (hasPermission) {
        console.log('Storage permissions already granted');
        return true;
      }
      
      console.log('Opening settings to request storage permissions');
      // If not, open settings to let user grant permissions
      await NativeSettings.open({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App
      });
      
      // Give user a moment to grant permissions
      toast.info('Por favor, concede permisos de almacenamiento');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again if permissions were granted
      return await this.checkStoragePermissions();
    } catch (error) {
      console.error('Error requesting storage permissions:', error);
      return false;
    }
  }
  
  /**
   * Check if storage permissions are granted
   */
  private async checkStoragePermissions(): Promise<boolean> {
    if (!this.isAndroid) {
      return true;
    }
    
    try {
      // We don't have a direct way to check storage permissions in Capacitor,
      // but we can try to read a directory to see if we have access
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
        try {
          await window.Capacitor.Plugins.Filesystem.readdir({
            path: '',
            directory: 'ExternalStorage'
          });
          console.log('Storage permissions: Granted');
          return true;
        } catch (error) {
          console.log('Storage permissions: Denied', error);
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking storage permissions:', error);
    }
    
    return false;
  }
  
  /**
   * Request NFC permissions for Android devices
   */
  public async requestNfcPermissions(): Promise<boolean> {
    if (!this.isAndroid) {
      return true;
    }
    
    try {
      // For NFC, we can only request through the settings
      await NativeSettings.open({
        optionAndroid: AndroidSettings.NFC,
        optionIOS: IOSSettings.App
      });
      
      toast.info('Por favor, habilita NFC si tu dispositivo lo soporta');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error requesting NFC permissions:', error);
      return false;
    }
  }
}
