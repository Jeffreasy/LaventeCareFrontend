/**
 * Storyblok Image Service Helpers
 * Optimizes images using Storyblok's built-in image service
 */

export interface StoryblokImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    fit?: 'in' | 'cover' | 'contain';
}

/**
 * Generate optimized Storyblok image URL
 * @param imageUrl - Original Storyblok image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export function optimizeStoryblokImage(
    imageUrl: string,
    options: StoryblokImageOptions = {}
): string {
    if (!imageUrl || !imageUrl.includes('a.storyblok.com')) {
        return imageUrl;
    }

    const params = new URLSearchParams();

    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('fm', options.format);
    if (options.fit) params.append('fit', options.fit);

    const separator = imageUrl.includes('?') ? '&' : '/m/';
    return `${imageUrl}${separator}${params.toString().replace(/&/g, '/')}`;
}

/**
 * Generate srcset for responsive images
 * @param imageUrl - Original Storyblok image URL
 * @param widths - Array of widths for srcset
 * @returns srcset string
 */
export function generateSrcSet(imageUrl: string, widths: number[]): string {
    return widths
        .map((width) => {
            const url = optimizeStoryblokImage(imageUrl, { width, format: 'webp' });
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Extract focal point from Storyblok image
 * @param imageUrl - Storyblok image URL with focal point
 * @returns Focal point coordinates or null
 */
export function extractFocalPoint(imageUrl: string): { x: number; y: number } | null {
    const match = imageUrl.match(/\/f\/(\d+)x(\d+)\//);
    if (!match) return null;

    return {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
    };
}
