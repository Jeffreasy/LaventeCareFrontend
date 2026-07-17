/**
 * Type-safe wrappers for the tenant SMTP configuration endpoints.
 */

import type { EmailStats, MailConfigResponse, SMTPConfig } from '../types';
import { apiClient } from '../api-client';

export async function getMailConfig(): Promise<MailConfigResponse> {
  return apiClient.get<MailConfigResponse>('/api/v1/admin/mail-config');
}

export async function updateMailConfig(config: SMTPConfig): Promise<void> {
  await apiClient.post('/api/v1/admin/mail-config', {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    from: config.from,
    tls_mode: config.tls_mode,
    admin_email: config.admin_email,
  });
}

export async function deleteMailConfig(): Promise<void> {
  await apiClient.delete('/api/v1/admin/mail-config');
}

export async function getEmailStats(): Promise<EmailStats> {
  return apiClient.get<EmailStats>('/api/v1/email-stats');
}

export async function testMailConnection(
  config: SMTPConfig
): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>('/api/v1/admin/mail-config/test', {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    from: config.from,
    tls_mode: config.tls_mode,
    admin_email: config.admin_email,
  });
}
