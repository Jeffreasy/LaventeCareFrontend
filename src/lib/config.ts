export const settings = {
    site_name: 'LaventeCare',
    meta_title: 'LaventeCare',
    meta_description: 'Enterprise Astro Application',
    favicon: [{ filename: '/favicon.svg' }],
    logo: [{
        filename: 'https://res.cloudinary.com/dgfuv7wif/image/upload/v1769967340/Gemini_Generated_Image_g7euilg7euilg7eu-removebg-preview_1_dwzy2f_c_crop_w_1920_h_1920_ar_1_1_g_auto_e_improve_e_sharpen_u6yfpq.png',
        alt: 'LaventeCare'
    }],
    main_menu: [
        {
            label: 'Home',
            link: { cached_url: 'home' }
        },
        {
            label: 'Diensten',
            link: { cached_url: '#' },
            items: [
                { label: 'Landing Pages', link: { cached_url: 'services/landing-pages' } },
                { label: 'Webshops', link: { cached_url: 'services/webshops' } },
                { label: 'Maatwerk Applicaties', link: { cached_url: 'services/custom-apps' } },
                { label: 'Alle Diensten', link: { cached_url: 'services' } }
            ]
        },
        {
            label: 'Het Ecosysteem',
            link: { cached_url: 'platform' }
        },
        {
            label: 'Security',
            link: { cached_url: 'security' }
        },
        {
            label: 'Prijzen',
            link: { cached_url: 'pricing' }
        },
        {
            label: 'Documentatie',
            link: { cached_url: 'docs' }
        }
    ],
    footer_columns: [
        {
            title: 'Bedrijf',
            links: [
                { label: 'Over LaventeCare', link: { cached_url: '#' } },
                { label: 'Missie & Visie', link: { cached_url: '#' } },
                { label: 'Contact', link: { cached_url: 'contact' } }
            ]
        },
        {
            title: 'Technologie',
            links: [
                { label: 'Astro', link: { cached_url: '#' } },
                { label: 'Go', link: { cached_url: '#' } },
                { label: 'PostgreSQL', link: { cached_url: '#' } },
                { label: 'Convex', link: { cached_url: '#' } }
            ]
        },
        {
            title: 'Juridisch',
            links: [
                { label: 'Privacy Policy', link: { cached_url: '#' } },
                { label: 'GDPR Compliance', link: { cached_url: '#' } },
                { label: 'Algemene Voorwaarden', link: { cached_url: '#' } }
            ]
        },
        {
            title: 'Status',
            links: [
                { label: 'System Status', link: { cached_url: '#' } },
                { label: 'Uptime', link: { cached_url: '#' } }
            ]
        }
    ],
    social_links: [],
    copyright_text: '© 2026 LaventeCare',
    gtm_id: null,
    cookie_consent_code: null,
    og_image: null,
};
