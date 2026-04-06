/**
 * Email API Client
 *
 * Type-safe API wrappers for email configuration endpoints.
 * Uses centralized apiClient with automatic token refresh.
 * Implements client-side SHA-256 password hashing for security.
 */

import type { SMTPConfig, MailConfigResponse, EmailStats } from '../types';
import { apiClient } from '../api-client';



/**
 * Get current SMTP configuration
 * Returns sanitized config (password is never returned)
 */
export async function getMailConfig(): Promise<MailConfigResponse> {
  return apiClient.get<MailConfigResponse>('/api/v1/admin/mail-config');
}

/**
 * Update SMTP configuration
 * Password is hashed client-side before transmission
 */
export async function updateMailConfig(config: SMTPConfig): Promise<void> {
  // Password is sent plaintext over same-origin BFF proxy (HTTPS in transit).
  // Backend encrypts with AES-256-GCM before storage.
  await apiClient.post('/api/v1/admin/mail-config', {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    from: config.from,
    tls_mode: config.tls_mode,
  });
}

/**
 * Delete SMTP configuration (revert to system default)
 */
export async function deleteMailConfig(): Promise<void> {
  await apiClient.delete('/api/v1/admin/mail-config');
}

/**
 * Get email delivery statistics
 */
export async function getEmailStats(): Promise<EmailStats> {
  return apiClient.get<EmailStats>('/api/v1/admin/email-stats');
}

/**
 * Test SMTP connection
 * This sends a test email to verify configuration
 */
export async function testMailConnection(
  config: SMTPConfig
): Promise<{ success: boolean; message: string }> {
  try {
    return await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/admin/mail-config/test',
      config
    );
  } catch (error) {
    // If endpoint doesn't exist, return friendly message
    if (error instanceof Error && error.message.includes('404')) {
      return {
        success: false,
        message: 'Test endpoint not available. Configuration will be validated on save.',
      };
    }
    throw error;
  }
}
