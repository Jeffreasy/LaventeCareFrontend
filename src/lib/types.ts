export interface Organization {
    id: string; // "e3253710-d965-42d2-bdf8-4cf3762381c2"
    name: string; // "LaventeCare"
    slug: string; // "laventecare"
    public_key: string; // "aa296a29-f68e-4f1b-a17f-9e7fc5ff8e76"
    // secret_key_hash: string; // backend only
    allowed_origins: string[]; // ["http://localhost:3000", ...]
    redirect_urls: string[];
    branding: {
        logo_url: string | null;
        primary_color: string; // "#ff6b00"
    };
    settings: {
        allow_registration: boolean;
    };
    is_active: boolean;
    created_at: string; // ISO Date "2026-01-28 19:46:35.281574+00"
    updated_at: string;
    app_url: string; // "https://laventecare.nl"
    mail_config?: any; // hidden/optional
}

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
    organization_id: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    organization: Organization;
}

export interface ShowcaseTenant {
    name: string;
    slug: string;
    app_url: string;
    logo_url: string | null;
    description: string;
    category: string;
    tagline?: string;
    tags?: string[];
    gallery_urls?: string[];
    social_links?: Record<string, string>;
}

export interface SEOProps {
    title: string;
    description: string;
    image?: {
        filename: string;
        alt?: string;
    };
    noindex?: boolean;
}
