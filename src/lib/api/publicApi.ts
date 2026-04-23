import { apiClient } from '../api-client';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(payload: ContactPayload): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>('/api/v1/public/contact', payload);
}

export interface GateStatsResponse {
  status: string;
  data: {
    threat_level: string;
    metrics: {
      total_bans_24h: number;
      total_blocked_requests_24h: number;
      active_ddos_detected: boolean;
    };
    active_bans: {
      reason: string;
      expires_in_seconds: number;
      is_recidivist: boolean;
    }[];
  };
}

export async function getPublicGateStats(): Promise<GateStatsResponse> {
  return apiClient.get<GateStatsResponse>('/api/v1/public/security/gate-stats');
}

export interface TelemetryPulseResponse {
  status: string;
  data: {
    active_connections: number;
    events_last_5min: number;
    total_events_today: number;
    status: string;
    worker_mesh: Record<string, string>;
  };
}

export async function getPublicTelemetryPulse(): Promise<TelemetryPulseResponse> {
  return apiClient.get<TelemetryPulseResponse>('/api/v1/public/telemetry/pulse');
}
