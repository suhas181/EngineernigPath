import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { api } from './api';

/**
 * Service to manage native Push Notifications on Android & iOS devices.
 * Gracefully no-ops when running in standard web browsers.
 */
export const initializePushNotifications = async (onNavigate?: (path: string) => void) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Check or request push permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permStatus.receive);
      return;
    }

    // 2. Register device with Firebase Cloud Messaging
    await PushNotifications.register();

    // 3. Listen for FCM registration token
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('[Push] FCM Token received:', token.value);
      localStorage.setItem('ep_fcm_token', token.value);

      // Attempt to register device token with backend if authenticated
      try {
        await api.post('/notifications/device-token', {
          token: token.value,
          platform: Capacitor.getPlatform(),
        });
      } catch {
        // Silently continue if user is not logged in yet; token will sync upon login
      }
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.warn('[Push] Registration error:', error);
    });

    // 4. Handle incoming notification when app is in foreground
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('[Push] Notification received in foreground:', notification);
      }
    );

    // 5. Handle action when student taps on the notification
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('[Push] Notification tapped:', action);
        const data = action.notification.data;
        if (data && data.actionUrl && onNavigate) {
          onNavigate(data.actionUrl);
        }
      }
    );
  } catch (err) {
    console.warn('[Push] Push notifications initialization error:', err);
  }
};
