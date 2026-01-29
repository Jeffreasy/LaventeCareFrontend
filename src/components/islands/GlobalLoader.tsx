import { useStore } from '@nanostores/react';
import { isLoading, loadingMessage } from '../../lib/stores';

export function GlobalLoader() {
    const $isLoading = useStore(isLoading);
    const $message = useStore(loadingMessage);

    if (!$isLoading) return null;

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center clinical-glass backdrop-blur-xl">
            <div className="text-center space-y-4">
                {/* Spinner */}
                <div className="inline-block w-16 h-16 border-4 border-white/20 border-t-[oklch(0.70_0.18_158)] rounded-full animate-spin" />

                {/* Message */}
                {$message && (
                    <p className="text-white/90 text-lg font-medium">
                        {$message}
                    </p>
                )}
            </div>
        </div>
    );
}
