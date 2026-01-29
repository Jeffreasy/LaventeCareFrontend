import { useStore } from '@nanostores/react';
import { notifications, removeNotification, type Notification } from '../../lib/stores';

export function NotificationToast() {
    const $notifications = useStore(notifications);
    const notificationList = Object.values($notifications);

    if (notificationList.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
            {notificationList.map((notification: Notification) => (
                <div
                    key={notification.id}
                    className={`
            clinical-glass p-4 rounded-xl shadow-lg
            animate-in slide-in-from-right duration-300
            flex items-start gap-3
          `}
                >
                    {/* Icon */}
                    <div className="shrink-0">
                        {notification.type === 'success' && <span className="text-2xl">✓</span>}
                        {notification.type === 'error' && <span className="text-2xl">✗</span>}
                        {notification.type === 'warning' && <span className="text-2xl">⚠</span>}
                        {notification.type === 'info' && <span className="text-2xl">ℹ</span>}
                    </div>

                    {/* Message */}
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-success' :
                            notification.type === 'error' ? 'text-error' :
                                notification.type === 'warning' ? 'text-warning' :
                                    'text-white'
                            }`}>
                            {notification.message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="shrink-0 text-white/50 hover:text-white transition-colors"
                        aria-label="Close notification"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
