import { atom, map } from 'nanostores';

/**
 * Global State Management with Nano Stores
 * Lightweight (300 bytes) alternative to Redux/Context for sharing state across Astro Islands
 */

// ============================================
// UI State
// ============================================

// Mobile menu open/close state
export const mobileMenuOpen = atom<boolean>(false);

// Global loading indicator
export const isLoading = atom<boolean>(false);

// Loading message (optional descriptive text)
export const loadingMessage = atom<string>('');

// ============================================
// Notification System
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // milliseconds
}

// Map store for notifications (can hold multiple)
export const notifications = map<Record<string, Notification>>({});

// Helper: Add notification
export function addNotification(type: Notification['type'], message: string, duration = 5000) {
  const id = `notif-${Date.now()}-${Math.random()}`;
  const notification: Notification = { id, type, message, duration };

  notifications.setKey(id, notification);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  return id;
}

// Helper: Remove notification
export function removeNotification(id: string) {
  const current = notifications.get();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _removed, ...rest } = current;
  notifications.set(rest);
}

// Helper: Clear all notifications
export function clearNotifications() {
  notifications.set({});
}

// ============================================
// Utility Functions
// ============================================

// Start loading with optional message
export function startLoading(message = '') {
  isLoading.set(true);
  loadingMessage.set(message);
}

// Stop loading
export function stopLoading() {
  isLoading.set(false);
  loadingMessage.set('');
}

// Show success notification
export function showSuccess(message: string) {
  return addNotification('success', message);
}

// Show error notification
export function showError(message: string) {
  return addNotification('error', message);
}

// Show warning notification
export function showWarning(message: string) {
  return addNotification('warning', message);
}

// Show info notification
export function showInfo(message: string) {
  return addNotification('info', message);
}
