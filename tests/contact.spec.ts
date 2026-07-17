import { expect, test } from '@playwright/test';

test('contact retries keep the key until business data changes after an error', async ({
  page,
}) => {
  const payloads: Array<Record<string, unknown>> = [];
  let refreshRequests = 0;
  await page.route('**/api/v1/auth/refresh', async (route) => {
    refreshRequests += 1;
    await route.fulfill({ status: 500, body: 'refresh must not be called' });
  });
  await page.route('**/api/v1/public/contact', async (route) => {
    payloads.push(route.request().postDataJSON() as Record<string, unknown>);
    const shouldFail = payloads.length < 3;
    await route.fulfill({
      status: shouldFail ? (payloads.length === 1 ? 401 : 503) : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        shouldFail ? { error: 'intake service temporarily unavailable' } : { status: 'success' }
      ),
    });
  });

  await page.goto('/contact');
  await page.getByRole('button', { name: 'IT Advies & Consultancy' }).click();
  const goal = page.getByLabel('Wat is de belangrijkste uitkomst? *');
  await goal.fill('Een betrouwbaar klantportaal bouwen.');
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  await page.getByLabel('Bedrijfsnaam *').fill('Voorbeeld BV');
  await page.getByLabel('Beschikbaar budget *').selectOption('€5.000 – €10.000');
  await page.getByRole('button', { name: 'Binnen 3 maanden' }).click();
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  await page.getByLabel('Uw naam *').fill('Test Gebruiker');
  await page.getByLabel('E-mailadres *').fill('test@example.com');
  const submit = page.getByRole('button', { name: 'Aanvraag versturen' });

  await submit.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('alert')).toBeVisible();
  await submit.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByLabel('Telefoonnummer').fill('+31 6 12 34 56 78');
  await submit.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('heading', { name: 'Aanvraag ontvangen' })).toBeVisible();

  expect(payloads).toHaveLength(3);
  expect(refreshRequests).toBe(0);
  expect(payloads[0].source).toBe('laventecare.nl');
  expect(payloads[0].requestId).toMatch(/^lcw_[A-Za-z0-9._:-]{8,}$/);
  expect(payloads[1].requestId).toBe(payloads[0].requestId);
  expect(payloads[2].requestId).not.toBe(payloads[1].requestId);
});
