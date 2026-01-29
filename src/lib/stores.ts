import { atom, map, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

/**
 * Global State Management with Nano Stores
 * Lightweight (300 bytes) alternative to Redux/Context for sharing state across Astro Islands
 * 
 * Features:
 * - Atoms: Simple values
 * - Maps: Object stores
 * - Computed: Derived values
 * - Persistent: LocalStorage sync
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
// Theme Management
// ============================================

// Theme preference with localStorage persistence
export const themePreference = persistentAtom<'light' | 'dark'>('theme', 'dark', {
    encode: JSON.stringify,
    decode: JSON.parse,
});

// Computed: CSS class for theme
export const themeClass = computed(themePreference, (theme) =>
    theme === 'dark' ? 'dark' : 'light'
);

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
export function addNotification(
    type: Notification['type'],
    message: string,
    duration = 5000
) {
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
    const { [id]: removed, ...rest } = current;
    notifications.set(rest);
}

// Helper: Clear all notifications
export function clearNotifications() {
    notifications.set({});
}

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
    cookieConsent: boolean;
    newsletterDismissed: boolean;
    language: 'nl' | 'en';
    reducedMotion: boolean;
}

export const userPreferences = persistentAtom<UserPreferences>(
    'user-preferences',
    {
        cookieConsent: false,
        newsletterDismissed: false,
        language: 'nl',
        reducedMotion: false,
    },
    {
        encode: JSON.stringify,
        decode: JSON.parse,
    }
);

// Helper: Update single preference
export function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
) {
    const current = userPreferences.get();
    userPreferences.set({ ...current, [key]: value });
}

// ============================================
// Modal Management
// ============================================

export interface ModalState {
    isOpen: boolean;
    modalId: string | null;
    data?: any; // Optional modal-specific data
}

export const modalState = atom<ModalState>({
    isOpen: false,
    modalId: null,
    data: null,
});

// Helper: Open modal
export function openModal(modalId: string, data?: any) {
    modalState.set({ isOpen: true, modalId, data });
}

// Helper: Close modal
export function closeModal() {
    modalState.set({ isOpen: false, modalId: null, data: null });
}

// ============================================
// Search State (Example)
// ============================================

export const searchQuery = atom<string>('');
export const searchResults = atom<any[]>([]);
export const isSearching = atom<boolean>(false);

// Computed: Has search results
export const hasSearchResults = computed(searchResults, (results) => results.length > 0);

// ============================================
// Cart (E-commerce Example)
// ============================================

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export const cartItems = persistentAtom<CartItem[]>('cart', [], {
    encode: JSON.stringify,
    decode: JSON.parse,
});

// Computed: Total cart value
export const cartTotal = computed(cartItems, (items) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0)
);

// Computed: Cart item count
export const cartCount = computed(cartItems, (items) =>
    items.reduce((count, item) => count + item.quantity, 0)
);

// Helper: Add to cart
export function addToCart(item: Omit<CartItem, 'quantity'>) {
    const current = cartItems.get();
    const existing = current.find(i => i.id === item.id);

    if (existing) {
        cartItems.set(
            current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        );
    } else {
        cartItems.set([...current, { ...item, quantity: 1 }]);
    }
}

// Helper: Remove from cart
export function removeFromCart(itemId: string) {
    const current = cartItems.get();
    cartItems.set(current.filter(item => item.id !== itemId));
}

// Helper: Clear cart
export function clearCart() {
    cartItems.set([]);
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
