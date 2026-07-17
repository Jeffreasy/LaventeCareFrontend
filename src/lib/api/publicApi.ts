import { apiClient } from '../api-client';

export interface ContactPayload {
  name: string;
  requestId: string;
  email: string;
  message: string;
  telefoon?: string;
  dienst?: string;
  budget?: string;
  timing?: string;
  bedrijf?: string;
  goal?: string;
  source?: string;
  pageUrl?: string;
}

export async function submitContactForm(payload: ContactPayload): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>('/api/v1/public/contact', payload, 'public');
}
