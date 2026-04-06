import { apiClient } from '../api-client';

export interface ContactPayload {
    name: string;
    email: string;
    message: string;
}

export async function submitContactForm(payload: ContactPayload): Promise<{ status: string }> {
    return apiClient.post<{ status: string }>('/api/v1/public/contact', payload);
}
