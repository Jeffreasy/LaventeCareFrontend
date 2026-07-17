import { useStore } from '@nanostores/react';
import { notifications, removeNotification, type Notification } from '../../lib/stores';

export function NotificationToast() {
  const $notifications = useStore(notifications);
  const notificationList = Object.values($notifications);

  if (notificationList.length === 0) return null;

  const iconMap = {
    success: (
      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notificationList.map((notification: Notification) => (
        <div
          key={notification.id}
          className="clinical-glass p-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 flex items-start gap-3"
        >
          <div className="shrink-0 mt-0.5">{iconMap[notification.type]}</div>

          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-success'
                  : notification.type === 'error'
                    ? 'text-error'
                    : notification.type === 'warning'
                      ? 'text-warning'
                      : 'text-white'
              }`}
            >
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className="shrink-0 text-white/50 hover:text-white transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
