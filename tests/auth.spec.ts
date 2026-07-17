import { expect, test } from '@playwright/test';
import { shouldAttemptRefresh } from '../src/lib/api-client';
import {
  buildProxyRequestHeaders,
  requestSourceMatchesOrigin,
  isDutchAdminHost,
  normalizeProxyPath,
} from '../src/lib/request-security';
import { classifyRefreshResponse } from '../src/lib/refresh-policy';
import { parsePublicRuntimeConfig } from '../src/lib/runtime-config';
import { classifyVerificationError } from '../src/lib/session-verification';

test('MFA response stays in verification flow and forwards pre-auth token', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mfa_required: true,
        pre_auth_token: 'pre-auth-test-token',
        user: { id: '3a03e508-2db5-4a99-a4e5-81e0749f3a3d' },
      }),
    });
  });

  const verification = page.waitForRequest('**/api/v1/auth/mfa/verify');
  await page.goto('/login?returnTo=%2Fadmin');
  await page.getByLabel('E-mailadres').fill('admin@example.com');
  await page.getByLabel('Wachtwoord').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Inloggen' }).click();

  await expect(page.getByRole('heading', { name: 'Tweestapsverificatie' })).toBeVisible();

  await page.route('**/api/v1/auth/mfa/verify', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.getByLabel('Verificatiecode').fill('123456');
  await page.getByRole('button', { name: 'Code controleren' }).click();

  const request = await verification;
  expect(request.headers().authorization).toBe('Bearer pre-auth-test-token');
  expect(request.postDataJSON()).toEqual({
    user_id: '3a03e508-2db5-4a99-a4e5-81e0749f3a3d',
    code: '123456',
  });
});
test('login origin comparison rejects prefix-confusion hosts', () => {
  const allowed = 'https://www.laventecare.nl';
  expect(requestSourceMatchesOrigin('https://www.laventecare.nl', null, allowed)).toBe(true);
  expect(
    requestSourceMatchesOrigin(
      'https://www.laventecare.nl.evil.example',
      allowed + '/login',
      allowed
    )
  ).toBe(false);
  expect(isDutchAdminHost('www.laventecare.nl.evil.example')).toBe(false);
});

test('runtime auth config fails closed without an explicit valid tenant', () => {
  expect(parsePublicRuntimeConfig({ PUBLIC_API_URL: 'https://auth.example' }).tenantId).toBeNull();
  expect(
    parsePublicRuntimeConfig({
      PUBLIC_API_URL: 'https://auth.example/',
      PUBLIC_TENANT_ID: 'e3253710-d965-42d2-bdf8-4cf3762381c2',
    })
  ).toMatchObject({
    apiUrl: 'https://auth.example',
    tenantId: 'e3253710-d965-42d2-bdf8-4cf3762381c2',
    jwtIssuer: 'https://auth.example',
  });
});

test('runtime URLs reject credentials, URL state and insecure production origins', () => {
  const tenant = 'e3253710-d965-42d2-bdf8-4cf3762381c2';
  for (const apiUrl of [
    'https://user:password@auth.example',
    'https://auth.example?tenant=other',
    'https://auth.example/#fragment',
    'https://auth.example/base-path',
    'http://auth.example',
    'http://localhost:8080',
  ]) {
    expect(
      parsePublicRuntimeConfig({ PUBLIC_API_URL: apiUrl, PUBLIC_TENANT_ID: tenant }).apiUrl
    ).toBeNull();
  }

  expect(
    parsePublicRuntimeConfig({
      PUBLIC_API_URL: 'http://127.0.0.1:8080/',
      PUBLIC_TENANT_ID: tenant,
      DEV: true,
    }).apiUrl
  ).toBe('http://127.0.0.1:8080');
  expect(
    parsePublicRuntimeConfig({
      PUBLIC_API_URL: 'http://auth.example',
      PUBLIC_TENANT_ID: tenant,
      DEV: true,
    }).apiUrl
  ).toBeNull();
});
test('JWT verifier outages are not treated as refreshable sessions', () => {
  expect(classifyVerificationError({ code: 'ERR_JWT_EXPIRED' })).toBe('invalid');
  expect(classifyVerificationError({ code: 'ERR_JWKS_TIMEOUT' })).toBe('unavailable');
  expect(classifyVerificationError(new TypeError('fetch failed'))).toBe('unavailable');
});

test('public 401 responses never enter the session refresh flow', () => {
  expect(shouldAttemptRefresh(401, '/api/v1/public/contact', 'public')).toBe(false);
  expect(shouldAttemptRefresh(401, '/api/v1/admin/mail-config', 'session')).toBe(true);
});
test('temporary refresh failures preserve the session', () => {
  expect(classifyRefreshResponse(204)).toBe('refreshed');
  expect(classifyRefreshResponse(400)).toBe('invalid');
  expect(classifyRefreshResponse(401)).toBe('invalid');
  expect(classifyRefreshResponse(403)).toBe('invalid');
  expect(classifyRefreshResponse(429)).toBe('unavailable');
  expect(classifyRefreshResponse(500)).toBe('unavailable');
});

test('BFF proxy accepts only normalized route segments', () => {
  expect(normalizeProxyPath('v1/admin/mail-config')).toBe('v1/admin/mail-config');
  for (const path of [
    '../admin',
    'v1/../admin',
    'v1/%2e%2e/admin',
    'v1/%2Fadmin',
    'v1\\admin',
    'v1//admin',
    'v1/admin?tenant=other',
    'v1/admin#fragment',
  ]) {
    expect(normalizeProxyPath(path)).toBeNull();
  }
});
test('BFF proxy strips spoofed routing headers and enforces configured tenant', () => {
  const headers = buildProxyRequestHeaders(
    new Headers({
      'X-Tenant-ID': 'attacker-tenant',
      Host: 'attacker.example',
      Connection: 'keep-alive, x-client-hop',
      'X-Client-Hop': 'remove-me',
      'Proxy-Authorization': 'secret',
      'X-Forwarded-For': '203.0.113.10',
      Cookie: 'access_token=opaque',
    }),
    'configured-tenant'
  );

  expect(headers.get('x-tenant-id')).toBe('configured-tenant');
  expect(headers.get('host')).toBeNull();
  expect(headers.get('connection')).toBeNull();
  expect(headers.get('x-client-hop')).toBeNull();
  expect(headers.get('proxy-authorization')).toBeNull();
  expect(headers.get('x-forwarded-for')).toBeNull();
  expect(headers.get('cookie')).toBe('access_token=opaque');
});
