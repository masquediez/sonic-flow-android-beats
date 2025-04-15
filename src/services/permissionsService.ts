
import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Service for handling native device permissions
 */
export class PermissionsService {
  private isAndroid = Capacitor.getPlatform() === 'android';
  
  /**
   * Request storage permissions for Android devices
   */
  public async requestStoragePermissions(): Promise<void> {
    if (!this.isAndroid) {
      return;
    }
    
    try {
      await NativeSettings.open({
        optionAndroid: AndroidSettings.ApplicationDetails
      });
      
      // Give user a moment to grant permissions if needed
      toast.info('Por favor, concede permisos de almacenamiento si se solicitan');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (settingsError) {
      console.log('Settings open not available or not needed:', settingsError);
    }
  }
}
