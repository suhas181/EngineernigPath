import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

/**
 * Service to manage native Push Notifications on Android / iOS devices.
 * Gracefully no-ops when running in standard desktop or mobile web browsers.
 */
export const initializePushNotifications = async (onNavigate?: (path: string) => void) => {
  // Only execute on native Android / iOS runtime
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Check existing permission status
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission denied by user.');
      return;
    }

    // 2. Register device with FCM / APNS
    await PushNotifications.register();

    // 3. Listen for FCM registration token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Mobile Push Token registered:', token.value);
      // Stored locally or optionally synced to backend
      localStorage.setItem('fcm_device_token', token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.warn('Error on push notification registration:', error);
    });

    // 4. Handle incoming notification when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received in foreground:', notification);
      }
    );

    // 5. Handle action when user taps on the push notification banner
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed:', notification);
        const data = notification.notification.data;
        if (data && data.actionUrl && onNavigate) {
          onNavigate(data.actionUrl);
        }
      }
    );
  } catch (err) {
    console.error('Failed to initialize native push notifications:', err);
  }
};
