/**
 * Email Configuration React Island
 * 
 * Interactive SMTP configuration form with:
 * - Client-side validation
 * - SHA-256 password hashing
 * - Test connection functionality
 * - Loading states & error handling
 */

import { useState, useEffect } from 'react';
import type { SMTPConfig } from '../../lib/types';
import {
    getMailConfig,
    updateMailConfig,
    deleteMailConfig,
    testMailConnection
} from '../../lib/api/emailApi';

export default function EmailConfig() {
    const [config, setConfig] = useState<SMTPConfig>({
        host: '',
        port: 587,
        user: '',
        password: '',
        from: '',
        tls_mode: 'starttls',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);

    // Load existing configuration
    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            setIsLoading(true);
            const response = await getMailConfig();

            if (response.configured && response.config) {
                setConfig({
                    host: response.config.host,
                    port: response.config.port,
                    user: response.config.user,
                    password: '', // Never returned by backend
                    from: response.config.from,
                    tls_mode: response.config.tls_mode as 'starttls' | 'tls',
                });
                setIsConfigured(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load configuration');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        // Validation
        if (!config.host || !config.user || !config.from) {
            setError('Please fill in all required fields');
            return;
        }

        if (!config.password && !isConfigured) {
            setError('Password is required for new configuration');
            return;
        }

        // Validate port
        const allowedPorts = [25, 465, 587, 2525];
        if (!allowedPorts.includes(config.port)) {
            setError('Port must be one of: 25, 465, 587, or 2525');
            return;
        }

        // Validate email format in 'from' field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const fromEmail = config.from.match(/<(.+)>/)?.[1] || config.from;
        if (!emailRegex.test(fromEmail)) {
            setError('Invalid email address in "From" field');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await updateMailConfig(config);

            setSuccess('SMTP configuration saved successfully');
            setIsConfigured(true);

            // Clear password field for security
            setConfig(prev => ({ ...prev, password: '' }));

            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleTest() {
        // Validation before test
        if (!config.host || !config.user || !config.password) {
            setError('Please fill in all fields before testing');
            return;
        }

        try {
            setIsTesting(true);
            setError(null);

            const result = await testMailConnection(config);

            if (result.success) {
                setSuccess(result.message || 'Connection test successful');
            } else {
                setError(result.message || 'Connection test failed');
            }

            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Test connection failed');
        } finally {
            setIsTesting(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to remove the custom SMTP configuration? System default will be used.')) {
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await deleteMailConfig();

            setSuccess('Configuration removed. Using system default SMTP.');
            setIsConfigured(false);
            setConfig({
                host: '',
                port: 587,
                user: '',
                password: '',
                from: '',
                tls_mode: 'starttls',
            });

            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove configuration');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-[oklch(0.70_0.18_158)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 font-display">Email Configuration</h2>
                <p className="text-white/60 font-ui text-sm">
                    Configure custom SMTP server for sending emails. Leave empty to use system default.
                </p>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm font-ui">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm font-ui">
                    {success}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Host */}
                    <div>
                        <label htmlFor="host" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            SMTP Host <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="host"
                            value={config.host}
                            onChange={(e) => setConfig({ ...config, host: e.target.value })}
                            placeholder="smtp.office365.com"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui placeholder:text-white/30"
                            required
                        />
                    </div>

                    {/* Port */}
                    <div>
                        <label htmlFor="port" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            Port <span className="text-red-400">*</span>
                        </label>
                        <select
                            id="port"
                            value={config.port}
                            onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui"
                            required
                        >
                            <option value="587">587 (STARTTLS)</option>
                            <option value="465">465 (TLS/SSL)</option>
                            <option value="25">25 (Standard)</option>
                            <option value="2525">2525 (Alternative)</option>
                        </select>
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            Username <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="user"
                            value={config.user}
                            onChange={(e) => setConfig({ ...config, user: e.target.value })}
                            placeholder="jeffrey@laventecare.nl"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui placeholder:text-white/30"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            Password {!isConfigured && <span className="text-red-400">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={config.password}
                            onChange={(e) => setConfig({ ...config, password: e.target.value })}
                            placeholder={isConfigured ? "Leave empty to keep current" : "Enter password"}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui placeholder:text-white/30"
                            required={!isConfigured}
                        />
                        {isConfigured && (
                            <p className="mt-1 text-xs text-white/40 font-ui">Password is hashed and stored securely</p>
                        )}
                    </div>

                    {/* From Address */}
                    <div className="md:col-span-2">
                        <label htmlFor="from" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            From Address <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="from"
                            value={config.from}
                            onChange={(e) => setConfig({ ...config, from: e.target.value })}
                            placeholder="LaventeCare <noreply@laventecare.nl>"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui placeholder:text-white/30"
                            required
                        />
                        <p className="mt-1 text-xs text-white/40 font-ui">
                            Format: "Display Name &lt;email@domain.com&gt;" or just "email@domain.com"
                        </p>
                    </div>

                    {/* TLS Mode */}
                    <div>
                        <label htmlFor="tls_mode" className="block text-sm font-medium text-white/70 mb-2 font-ui">
                            TLS Mode <span className="text-red-400">*</span>
                        </label>
                        <select
                            id="tls_mode"
                            value={config.tls_mode}
                            onChange={(e) => setConfig({ ...config, tls_mode: e.target.value as 'starttls' | 'tls' })}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.70_0.18_158)] focus:border-[oklch(0.70_0.18_158)]/50 backdrop-blur-sm transition-all duration-200 font-ui"
                            required
                        >
                            <option value="starttls">STARTTLS (Recommended for port 587)</option>
                            <option value="tls">TLS/SSL (For port 465)</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3 rounded-lg bg-[oklch(0.70_0.18_158)] text-white font-bold hover:bg-[oklch(0.60_0.20_160)] transition-all duration-300 flex items-center justify-center space-x-2 font-ui shadow-lg shadow-[oklch(0.70_0.18_158)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Save Configuration</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={isTesting || !config.host || !config.user || !config.password}
                        className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2 font-ui disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTesting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Testing...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                <span>Test Connection</span>
                            </>
                        )}
                    </button>

                    {isConfigured && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 font-bold hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center space-x-2 font-ui disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            <span>Remove Configuration</span>
                        </button>
                    )}
                </div>
            </form>

            {/* Info Panel */}
            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="text-sm text-blue-200 font-ui">
                        <p className="font-bold mb-1">Security Note:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                            <li>Password is hashed (SHA-256) client-side before transmission</li>
                            <li>Backend encrypts hashed password with AES-256-GCM</li>
                            <li>Password is never returned by the API</li>
                            <li>Only allowed ports: 25, 465, 587, 2525</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
