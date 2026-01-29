import { z } from 'zod';

/**
 * Type Definitions & Zod Schemas
 * Central location for all type-safe data structures
 * Following Rule 3: Type-Safe Components
 */

// ============================================
// Navigation & Menu Types
// ============================================

export const MenuItemSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    link: z.object({
        cached_url: z.string(),
    }),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

// Simplified menu item for islands
export const SimpleMenuItemSchema = z.object({
    label: z.string(),
    href: z.string(),
});

export type SimpleMenuItem = z.infer<typeof SimpleMenuItemSchema>;

// ============================================
// Footer Types
// ============================================

export const FooterColumnSchema = z.object({
    title: z.string(),
    links: z.array(MenuItemSchema),
});

export type FooterColumn = z.infer<typeof FooterColumnSchema>;

export const SocialLinkSchema = z.object({
    platform: z.string(),
    url: z.string().url(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

// ============================================
// Hero Section Types
// ============================================

export const CTASchema = z.object({
    label: z.string(),
    url: z.string(),
});

export type CTA = z.infer<typeof CTASchema>;

export const HeroPropsSchema = z.object({
    headline: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.object({
        filename: z.string(),
        alt: z.string().optional(),
    }).optional(),
    ctaPrimary: CTASchema.optional(),
    ctaSecondary: CTASchema.optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    size: z.enum(['small', 'medium', 'large']).default('large'),
});

export type HeroProps = z.infer<typeof HeroPropsSchema>;

// ============================================
// SEO Types
// ============================================

export const SEOPropsSchema = z.object({
    title: z.string(),
    description: z.string(),
    ogImage: z.object({
        filename: z.string(),
        alt: z.string().optional(),
    }).optional(),
});

export type SEOProps = z.infer<typeof SEOPropsSchema>;

// ============================================
// Image Types
// ============================================

export const ImageSchema = z.object({
    filename: z.string(),
    alt: z.string().optional(),
});

export type Image = z.infer<typeof ImageSchema>;

// ============================================
// Button Component Types
// ============================================

export const ButtonVariantSchema = z.enum(['primary', 'secondary', 'ghost', 'outline']);
export const ButtonSizeSchema = z.enum(['sm', 'md', 'lg']);

export type ButtonVariant = z.infer<typeof ButtonVariantSchema>;
export type ButtonSize = z.infer<typeof ButtonSizeSchema>;

// ============================================
// Input Component Types
// ============================================

export const InputTypeSchema = z.enum(['text', 'email', 'password', 'number', 'tel', 'url']);
export type InputType = z.infer<typeof InputTypeSchema>;

// ============================================
// Card Component Types
// ============================================

export const CardPaddingSchema = z.enum(['none', 'sm', 'md', 'lg']);
export type CardPadding = z.infer<typeof CardPaddingSchema>;

// ============================================
// Site Configuration Types
// ============================================

export const SiteConfigSchema = z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string().url(),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// ============================================
// Utility: Validate and Parse
// ============================================

/**
 * Safely parse data with Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed data or throws validation error
 */
export function parseWithSchema<T extends z.ZodType>(
    schema: T,
    data: unknown
): z.infer<T> {
    return schema.parse(data);
}

/**
 * Safely parse data with Zod schema, returning null on error
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed data or null if validation fails
 */
export function safeParseWithSchema<T extends z.ZodType>(
    schema: T,
    data: unknown
): z.infer<T> | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}
