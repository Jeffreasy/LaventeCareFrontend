import { onCLS, onLCP, onINP, onTTFB, type Metric } from 'web-vitals';

/**
 * Performance Budget Thresholds
 * Based on Core Web Vitals and industry best practices
 */
export const PERFORMANCE_BUDGETS = {
    LCP: 2500,  // Largest Contentful Paint (ms)
    INP: 100,   // Interaction to Next Paint (ms)
    CLS: 0.1,   // Cumulative Layout Shift (score)
    TTFB: 800,  // Time to First Byte (ms)
};

/**
 * Route-Specific Performance Budgets
 * Stricter budgets for marketing pages, more lenient for authenticated
 */
export const ROUTE_BUDGETS: Record<string, Partial<typeof PERFORMANCE_BUDGETS>> = {
    '/': { LCP: 2000 },           // Homepage - strictest
    '/pricing': { LCP: 2000 },    // Marketing page
    '/contact': { LCP: 2200 },    // Conversion page
    '/services': { LCP: 2200 },   // Marketing pages
    '/admin': { LCP: 3000 },      // Authenticated, more lenient
    '/platform': { LCP: 2500 },   // Info page
    '/security': { LCP: 2500 },   // Info page
    '/docs': { LCP: 2500 },       // Documentation
};

/**
 * Get performance budget for current route
 */
export function getCurrentBudgets(): typeof PERFORMANCE_BUDGETS {
    const path = window.location.pathname;

    // Check for exact match
    if (ROUTE_BUDGETS[path]) {
        return { ...PERFORMANCE_BUDGETS, ...ROUTE_BUDGETS[path] };
    }

    // Check for partial match (e.g., /services/custom-apps)
    for (const [route, budgets] of Object.entries(ROUTE_BUDGETS)) {
        if (path.startsWith(route)) {
            return { ...PERFORMANCE_BUDGETS, ...budgets };
        }
    }

    return PERFORMANCE_BUDGETS;
}

/**
 * Check if metric exceeds budget
 */
function isBudgetExceeded(name: string, value: number): boolean {
    const budgets = getCurrentBudgets();
    const budget = budgets[name as keyof typeof PERFORMANCE_BUDGETS];

    if (!budget) return false;

    return value > budget;
}

/**
 * Log performance metric with budget comparison
 */
function logMetric(metric: Metric) {
    const budgets = getCurrentBudgets();
    const budget = budgets[metric.name as keyof typeof PERFORMANCE_BUDGETS];
    const exceeded = isBudgetExceeded(metric.name, metric.value);

    const emoji = exceeded ? '⚠️' : '✅';
    const status = exceeded ? 'EXCEEDED' : 'OK';

    console.group(`${emoji} ${metric.name} - ${status}`);
    console.log(`Value: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`);
    console.log(`Budget: ${budget}${metric.name === 'CLS' ? '' : 'ms'}`);
    console.log(`Route: ${window.location.pathname}`);
    console.log(`Rating: ${metric.rating}`);
    console.groupEnd();

    // In production, send to analytics or monitoring service
    if (import.meta.env.PROD && exceeded) {
        // Could send to Vercel Analytics or custom monitoring
        console.warn(`Performance budget exceeded: ${metric.name} = ${metric.value}`);
    }
}

/**
 * Initialize performance monitoring
 * Observes Core Web Vitals and logs budget compliance
 */
export function initPerformanceMonitoring() {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const route = window.location.pathname;

    if (import.meta.env.DEV) {
        console.log(`[Performance] Monitoring initialized for route: ${route}`);
        console.table(getCurrentBudgets());
    }

    // Largest Contentful Paint
    onLCP((metric) => {
        if (import.meta.env.DEV) logMetric(metric);
    });

    // Interaction to Next Paint (modern responsiveness metric)
    onINP((metric) => {
        if (import.meta.env.DEV) logMetric(metric);
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
        if (import.meta.env.DEV) logMetric(metric);
    });

    // Time to First Byte
    onTTFB((metric) => {
        if (import.meta.env.DEV) logMetric(metric);
    });
}

/**
 * Get performance summary
 * Useful for debugging or manual checks
 */
export async function getPerformanceSummary(): Promise<{
    metrics: Record<string, number>;
    budgets: typeof PERFORMANCE_BUDGETS;
    route: string;
    compliance: Record<string, boolean>;
}> {
    return new Promise((resolve) => {
        const metrics: Record<string, number> = {};
        const budgets = getCurrentBudgets();
        const route = window.location.pathname;

        let collected = 0;
        const total = 4; // LCP, INP, CLS, TTFB

        const checkComplete = () => {
            collected++;
            if (collected >= total) {
                const compliance: Record<string, boolean> = {};
                for (const [name, value] of Object.entries(metrics)) {
                    compliance[name] = !isBudgetExceeded(name, value);
                }

                resolve({ metrics, budgets, route, compliance });
            }
        };

        onLCP((m) => { metrics.LCP = m.value; checkComplete(); });
        onINP((m) => { metrics.INP = m.value; checkComplete(); });
        onCLS((m) => { metrics.CLS = m.value; checkComplete(); });
        onTTFB((m) => { metrics.TTFB = m.value; checkComplete(); });

        // Timeout after 10 seconds
        setTimeout(() => {
            if (collected < total) {
                resolve({ metrics, budgets, route, compliance: {} });
            }
        }, 10000);
    });
}
