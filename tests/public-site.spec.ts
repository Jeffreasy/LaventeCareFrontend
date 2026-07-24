import { expect, test, type Page } from '@playwright/test';

const LOCAL = 'http://localhost:4321';

async function useLocale(page: Page, locale: 'nl' | 'en') {
  await page.setExtraHTTPHeaders({
    'x-forwarded-host': locale === 'en' ? 'www.laventecare.com' : 'www.laventecare.nl',
  });
}

test.describe('public website', () => {
  test('renders a meaningful Dutch homepage without a soft 404', async ({ page }) => {
    await useLocale(page, 'nl');
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: /B2B systeempartner voor mkb-organisaties/i })
    ).toBeVisible();
    await expect(page).toHaveTitle(/LaventeCare/);
  });

  test('returns a real, localised 404 response', async ({ page }) => {
    await useLocale(page, 'nl');
    const nlResponse = await page.goto('/bestaat-niet');
    expect(nlResponse?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeVisible();

    await useLocale(page, 'en');
    const enResponse = await page.goto('/does-not-exist');
    expect(enResponse?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('keeps Dutch and English routes on their matching domain', async ({ page, browser }) => {
    await useLocale(page, 'en');
    await page.goto('/prijzen');
    expect(page.url()).toBe(`${LOCAL}/pricing`);
    await expect(
      page.getByRole('heading', { name: /Clear prices for three different routes/i })
    ).toBeVisible();

    const nlContext = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-host': 'www.laventecare.nl' },
    });
    const nlPage = await nlContext.newPage();
    await nlPage.goto(`${LOCAL}/pricing`);
    expect(nlPage.url()).toBe(`${LOCAL}/prijzen`);
    await nlContext.close();
  });

  test('publishes localised website packages with canonical and alternate URLs', async ({
    page,
    browser,
  }) => {
    await useLocale(page, 'nl');
    const nlResponse = await page.goto('/diensten/websites');
    expect(nlResponse?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: /professionele website die snel blijft/i })
    ).toBeVisible();
    await expect(
      page.getByAltText('LaventeCare — professionele websites vanaf €750')
    ).toBeVisible();
    await expect(page.getByText('€750', { exact: true }).first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.laventecare.nl/diensten/websites'
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      'https://www.laventecare.com/services/websites'
    );

    const enContext = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-host': 'www.laventecare.com' },
    });
    const enPage = await enContext.newPage();
    await enPage.goto(`${LOCAL}/diensten/websites`);
    expect(enPage.url()).toBe(`${LOCAL}/services/websites`);
    await expect(
      enPage.getByRole('heading', { name: /professional website that stays fast/i })
    ).toBeVisible();
    await enContext.close();
  });

  test('shows website packages on both pricing pages', async ({ page }) => {
    await useLocale(page, 'nl');
    await page.goto('/prijzen');
    await expect(page.getByRole('heading', { name: 'Website Start', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Website Business', exact: true })
    ).toBeVisible();
    await expect(page.getByText('€29', { exact: true })).toBeVisible();
    await expect(page.getByText('€49', { exact: true })).toBeVisible();
    await expect(page.getByText('€75', { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Heldere prijzen voor drie verschillende routes' })
    ).toBeVisible();

    await useLocale(page, 'en');
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: 'Custom Website', exact: true })).toBeVisible();
  });

  test('publishes aligned privacy, care and terms pages', async ({ page }) => {
    await useLocale(page, 'nl');
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacyverklaring' })).toBeVisible();

    await page.goto('/website-care');
    await expect(page.getByRole('heading', { name: 'Website Care Start' })).toBeVisible();
    await expect(page.getByText('€29', { exact: true })).toBeVisible();
    await expect(page.getByText(/één volledige kalendermaand/i)).toBeVisible();

    await page.goto('/voorwaarden');
    await expect(page.getByRole('heading', { name: 'Algemene Voorwaarden' })).toBeVisible();
    await expect(page.getByText(/Website Start kost €750 eenmalig/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download Nederlandse PDF' })).toHaveAttribute(
      'href',
      '/LCVoorwaarden2026juli.pdf'
    );
  });

  test('serves English portfolio content and canonical URLs', async ({ page }) => {
    await useLocale(page, 'en');
    await page.goto('/portfolio/jeffdash');
    await expect(page.getByRole('heading', { name: 'JeffDash', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What had to change' })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.laventecare.com/portfolio/jeffdash'
    );
  });

  test('publishes host-aware sitemap and robots files', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml', {
      headers: { 'x-forwarded-host': 'www.laventecare.com' },
    });
    expect(sitemap.ok()).toBeTruthy();
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain('<loc>https://www.laventecare.com/');
    expect(sitemapBody).toContain('<loc>https://www.laventecare.com/services/websites</loc>');
    expect(sitemapBody).not.toContain('<loc>https://www.laventecare.nl/');

    const robots = await request.get('/robots.txt', {
      headers: { 'x-forwarded-host': 'www.laventecare.nl' },
    });
    expect(await robots.text()).toContain('Sitemap: https://www.laventecare.nl/sitemap.xml');
  });
});

test.describe('consent and intake', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      if (!window.sessionStorage.getItem('test-consent-cleared')) {
        window.localStorage.removeItem('consent_state');
        window.sessionStorage.setItem('test-consent-cleared', 'true');
      }
    });
  });

  test('asks for consent, remembers it and allows reopening preferences', async ({ page }) => {
    await useLocale(page, 'nl');
    await page.goto('/');
    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await page.getByTestId('accept-cookies').click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(banner).toBeHidden();
    await page.getByRole('button', { name: 'Cookievoorkeuren' }).click();
    await expect(page.getByRole('dialog', { name: 'Cookievoorkeuren beheren' })).toBeVisible();
  });

  test('submits the accessible English intake flow', async ({ page }) => {
    await useLocale(page, 'en');
    await page.route('**/api/v1/public/contact', async (route) => {
      expect(route.request().method()).toBe('POST');
      const payload = route.request().postDataJSON();
      expect(payload.source).toBe('laventecare.com');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      });
    });

    await page.goto('/contact');
    await page.getByTestId('accept-cookies').click();
    const projectChoice = page.getByRole('button', { name: 'AI & Automation' });
    await projectChoice.click();
    await expect(projectChoice).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('2. What is the most important outcome? *').fill('Automate intake');
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByLabel('Company name *').fill('Example BV');
    await page.getByLabel('Available budget *').selectOption('€5,000 – €10,000');
    await page.getByRole('button', { name: 'Within 3 months' }).click();
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByLabel('Your name *').fill('Alex Example');
    await page.getByLabel('Email address *').fill('alex@example.com');
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('status')).toContainText('Request received');
  });

  test('preselects the website fast track and its matching budget guidance', async ({ page }) => {
    await useLocale(page, 'nl');
    await page.goto('/contact?type=website-business');
    await expect(page.locator('astro-island[component-export="ContactForm"]')).not.toHaveAttribute(
      'ssr',
      ''
    );
    const websiteChoice = page.getByRole('button', { name: 'Professionele Website' });
    await expect(websiteChoice).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByLabel('2. Wat is de belangrijkste uitkomst? *')
      .fill('Een professionele website met aanvraagformulier');
    await websiteChoice.click();
    await expect(websiteChoice).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Volgende stap' }).click();
    await expect(page.getByText('Vaste websitepakketten starten bij €750.')).toBeVisible();
    await expect(page.getByLabel('Beschikbaar budget *')).toContainText('€1.000 – €2.500');
  });

  test('keeps the selected website package in the submitted intake', async ({ page }) => {
    await useLocale(page, 'nl');
    let submittedMessage = '';
    await page.route('**/api/v1/public/contact', async (route) => {
      submittedMessage = route.request().postDataJSON().message;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      });
    });

    await page.goto('/contact?type=website-business');
    await expect(page.locator('astro-island[component-export="ContactForm"]')).not.toHaveAttribute(
      'ssr',
      ''
    );
    await expect(page.getByRole('button', { name: 'Professionele Website' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page
      .getByLabel('2. Wat is de belangrijkste uitkomst? *')
      .fill('Een website met een goed aanvraagformulier');
    await page.getByRole('button', { name: 'Volgende stap' }).click();
    await page.getByLabel('Bedrijfsnaam *').fill('Voorbeeld BV');
    await page.getByLabel('Beschikbaar budget *').selectOption('€1.000 – €2.500');
    await page.getByRole('button', { name: 'Binnen 3 maanden' }).click();
    await page.getByRole('button', { name: 'Volgende stap' }).click();
    await page.getByLabel('Uw naam *').fill('Jeff Voorbeeld');
    await page.getByLabel('E-mailadres *').fill('jeff@example.com');
    await page.getByRole('button', { name: 'Aanvraag versturen' }).click();
    await expect(page.getByRole('status')).toContainText('Aanvraag ontvangen');
    expect(submittedMessage).toContain('Pakketvoorkeur: Website Business — €1.000 eenmalig');
  });
});
