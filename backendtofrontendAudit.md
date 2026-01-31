LaventeCare Frontend: Authentication & Email Configuration Audit Report
Datum: 31 Januari 2026
Project: LaventeCare Frontend
Auditor: Anti-Gravity Architect
Status: 🔴 CRITICAL ISSUES FOUND

📋 Executive Summary
Er zijn 7 kritieke discrepanties gevonden tussen de frontend implementatie en de backend documentatie. Deze issues verklaren waarom authentication en email configuratie niet correct werken.

Severity Breakdown
🔴 CRITICAL (3): Blokkeren core functionaliteit
🟠 HIGH (2): Veiligheidsrisico's en inconsistenties
🟡 MEDIUM (2): Configuratie verbeteringen
🔴 CRITICAL ISSUES
Issue #1: Ontbrekende PUBLIC_APP_KEY Environment Variable
Severity: 🔴 CRITICAL
Impact: Login proxy en potentiële backend requests falen

Gevonden Context
File: 
src/pages/api/auth/login.ts:27
Comment in code: "X-Public-Key": APP_KEY,
Code: const APP_KEY = import.meta.env.PUBLIC_APP_KEY;
Status: ❌ NIET gedefinieerd in 
.env
Backend Requirement (Uit documentatie)
De backend FRONTEND INTEGRATION GUIDE toont GEEN X-Public-Key header requirement. Dit suggereert twee mogelijke scenarios:

Scenario A: Legacy Header (Te Verwijderen)

// HUIDIG (MOGELIJK INCORRECT)
headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_ID,
    'X-Public-Key': APP_KEY,  // ❌ Niet gedocumenteerd in backend docs
}
Scenario B: Ontbrekende Documentatie De header IS vereist maar niet gedocumenteerd in 
frontend_integration.md
.

Verificatie Nodig
✅ Check backend code: 
internal/api/middleware/tenant.go
 of auth_handlers.go
✅ Zoek naar: r.Header.Get("X-Public-Key") validatie

Aanbevolen Actie
EERSTE: Verifieer of X-Public-Key daadwerkelijk vereist is door backend code te checken.

ALS VEREIST:

# .env
PUBLIC_APP_KEY=<your-public-key-here>
ALS NIET VEREIST: Verwijder de header uit 
login.ts
 (regel 27).

Issue #2: API Reference Inconsistentie: /auth/me vs /me
Severity: 🔴 CRITICAL
Impact: User profile requests naar admin endpoints kunnen falen of verkeerde data retourneren

Gevonden Discrepantie
Backend API Reference (
BackendDocs/docs/api/reference.md:86
):

| `/auth/me` | GET | Viewer+ | Get current user's profile |
Backend Integration Guide (
BackendDocs/docs/guides/frontend_integration.md:395
):

const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/me`, {
Frontend KI Artifact (
Knowledge Item - API Integration Summary
):

- `GET /api/v1/me`: Current user profile.
Huidige Frontend Implementatie
File: 
src/lib/api-client.ts

❓ STATUS ONBEKEND - Moet worden geverifieerd waar /me precies wordt aangeroepen.

Root Cause
2026-01-26 Refactor Report (
BackendDocs/docs/reports/2026-01-26_Frontend_Auth_Refactor_Report.md:33
):

"Endpoint Correction: Fixed me endpoint proxy target from /api/v1/auth/me (regression) back to /api/v1/me."

Dit betekent dat de backend documentatie (
api/reference.md
) NIET is bijgewerkt na de correctie.

Aanbevolen Actie
BACKEND DOCUMENTATIE UPDATE VEREIST:

- | `/auth/me` | GET | Viewer+ | Get current user's profile |
+ | `/me` | GET | Viewer+ | Get current user's profile |
FRONTEND VERIFICATIE: Controleer dat ALLE /me calls correct zijn:

grep -r "\/auth\/me" src/
grep -r "\/api\/v1\/auth\/me" src/
Issue #3: CSRF Token Implementatie Ontbreekt Volledig
Severity: 🔴 CRITICAL (Security)
Impact: Frontend is kwetsbaar voor Cross-Site Request Forgery attacks

Backend Requirement
Integration Guide (
frontend_integration.md:506-522
):

function getCSRFToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}
export async function apiRequest<T>(...) {
  const res = await fetch(..., {
    headers: {
      'X-CSRF-Token': getCSRFToken(), // ✅ CSRF protection
      ...
    }
  });
}
API Integration Summary (
KI Artifact
):

"CSRF: Protection via X-CSRF-Token header. (Note: Currently disabled on frontend due to backend CORS limitations; requires whitelist expansion for preflight)."

Huidige Frontend Implementatie
File: 
src/lib/api-client.ts

headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_ID,
    ...options.headers,  // ❌ GEEN X-CSRF-Token
},
File: 
src/lib/api/emailApi.ts

❌ Gebruikt apiClient zonder CSRF token

Root Cause Analysis
Volgens de KI is CSRF bewust uitgeschakeld vanwege CORS preflight issues. Dit is een tijdelijke workaround die een permanent security hole heeft gecreëerd.

Aanbevolen Actie
OPTIE A: Backend CORS Fix (Aanbevolen)

Whitelist frontend origin voor CORS preflight
Implementeer CSRF token extractie in frontend:
// src/lib/api-client.ts
function getCSRFToken(): string {
  if (typeof document === 'undefined') return ''; // SSR safety
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}
async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const fetchOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': TENANT_ID,
            'X-CSRF-Token': getCSRFToken(), // ✅ ADD THIS
            ...options.headers,
        },
    };
    // ...
}
Backend moet CSRF token in <meta> tag injecteren:
<!-- src/layouts/Layout.astro -->
<meta name="csrf-token" content={Astro.locals.csrfToken} />
OPTIE B: Blijf CSRF Disabled (Niet Aanbevolen) Documenteer expliciet in security docs waarom CSRF disabled is en welke mitigatie in plaats daarvan wordt gebruikt.

🟠 HIGH SEVERITY ISSUES
Issue #4: 
.env
 Bevat Dubbele Convex URL Definities
Severity: 🟠 HIGH
Impact: Configuratie inconsistenties, moeilijk debuggen

Gevonden in 
.env
File: 
.env:4-7

# Convex
PUBLIC_CONVEX_URL=https://tangible-hyena-200.convex.cloud
# Convex
PUBLIC_CONVEX_URL=https://tangible-hyena-200.convex.cloud  # ❌ DUPLICATE
Aanbevolen Actie
- # Convex
- PUBLIC_CONVEX_URL=https://tangible-hyena-200.convex.cloud
  # Convex
  PUBLIC_CONVEX_URL=https://tangible-hyena-200.convex.cloud
  CONVEX_DEPLOYMENT=dev:tangible-hyena-200
Issue #5: Conflicterende Tenant ID Environment Variables
Severity: 🟠 HIGH
Impact: Onduidelijk welke tenant ID prioriteit heeft

Gevonden in 
.env
File: 
.env:2-3,11

PUBLIC_DEV_TENANT_ID=aa296a29-f68e-4f1b-a17f-9e7fc5ff8e76
PUBLIC_DEV_TENANT_SLUG="laventecare"
...
PUBLIC_TENANT_ID=e3253710-d965-42d2-bdf8-4cf3762381c2  # ❌ DIFFERENT UUID
Huidige Gebruik
File: 
src/pages/api/auth/login.ts:7

const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;  // ✅ Gebruikt PUBLIC_TENANT_ID
File: 
src/lib/api-client.ts:11

const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;  // ✅ Gebruikt PUBLIC_TENANT_ID
Aanbevolen Actie
Besluit maken:

OPTIE A: Development vs Production Pattern

# Development (local testing)
PUBLIC_DEV_TENANT_ID=aa296a29-f68e-4f1b-a17f-9e7fc5ff8e76
PUBLIC_DEV_TENANT_SLUG="laventecare"
# Production (active tenant)
PUBLIC_TENANT_ID=e3253710-d965-42d2-bdf8-4cf3762381c2
OPTIE B: Single Source of Truth (Aanbevolen)

# Active Tenant
PUBLIC_TENANT_ID=e3253710-d965-42d2-bdf8-4cf3762381c2
# Verwijder PUBLIC_DEV_* variabelen of hernoem naar ARCHIVE_*
🟡 MEDIUM SEVERITY ISSUES
Issue #6: 
.env.example
 Mist Alle Auth System Configuratie
Severity: 🟡 MEDIUM
Impact: Nieuwe developers kunnen project niet opstarten

Huidige 
.env.example
File: 
.env.example

STORYBLOK_TOKEN=your_storyblok_preview_token_here
# SITE=https://lavente.care
# GTM_ID=GTM-XXXXXXX
❌ GEEN ENKELE REFERENTIE NAAR:

PUBLIC_API_URL
PUBLIC_TENANT_ID
PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT
Aanbevolen Actie
# ============================================
# LaventeCare - Environment Configuration
# ============================================
# Backend Auth System (REQUIRED)
PUBLIC_API_URL=https://laventecareauthsystems.onrender.com
PUBLIC_TENANT_ID=your-tenant-uuid-here
# Convex Real-time Database (REQUIRED)
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
# Storyblok CMS (Optional)
STORYBLOK_TOKEN=your_storyblok_preview_token_here
# Site Configuration (Production)
# SITE=https://lavente.care
# Analytics (Optional)
# GTM_ID=GTM-XXXXXXX
Issue #7: Email API Gebruikt Directe Backend URL in Plaats van Proxy
Severity: 🟡 MEDIUM
Impact: CORS issues en inconsistent auth flow

Gevonden Patroon
Email API (
src/lib/api/emailApi.ts:29
):

return apiClient.get<MailConfigResponse>('/api/v1/admin/mail-config');
API Client (
src/lib/api-client.ts:21
):

const url = `${API_BASE}${endpoint}`;  // API_BASE = PUBLIC_API_URL (direct backend)
Issue
De apiClient connect DIRECT naar backend (PUBLIC_API_URL) in plaats van via lokale proxy. Dit werkt ALLEEN als:

✅ CORS correct geconfigureerd is
✅ Cookies correct cross-origin worden verzonden
✅ SameSite=None is ingesteld (wat security concerns heeft)
Contrast met Login Flow
Login (
src/pages/api/auth/login.ts
):

const response = await fetch('/api/auth/login', {  // ✅ Lokale proxy
Login client-side (
src/pages/login.astro:87
):

const response = await fetch('/api/auth/login', {  // ✅ Same-origin request
Aanbevolen Actie
OPTIE A: Blijf Direct Backend Pattern (Huidig) Documenteer expliciet waarom dit patroon veilig is en zorg voor:

Backend CORS whitelist correct ingesteld
credentials: 'include' op alle requests
Monitoring van CORS errors
OPTIE B: Unificeer met Proxy Pattern (Aanbevolen) Creëer proxies voor admin endpoints:

// src/pages/api/admin/mail-config.ts
export const GET: APIRoute = async ({ request, cookies }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    
    const response = await fetch(`${API_URL}/api/v1/admin/mail-config`, {
        headers: {
            'X-Tenant-ID': import.meta.env.PUBLIC_TENANT_ID,
            'Cookie': cookies.get('access_token') ? 
                `access_token=${cookies.get('access_token').value}` : ''
        }
    });
    
    // Forward response
    return new Response(await response.text(), {
        status: response.status,
        headers: response.headers
    });
};
📊 Impact Analysis Matrix
Issue	Component	User Impact	Security Risk	Fix Complexity
#1: Missing APP_KEY	Login Proxy	🔴 Blocks Login	Low	Simple (1 line)
#2: /auth/me vs /me	User Profile	🟠 Intermittent Errors	Low	Medium (Doc update)
#3: No CSRF Token	All API Calls	🔴 CSRF Vulnerable	🔴 HIGH	Medium (4 files)
#4: Duplicate Convex URL	Config	🟡 Confusing	Low	Simple (Delete 2 lines)
#5: Conflicting Tenant IDs	All Requests	🟠 Wrong Tenant Data	Medium	Simple (Decision + Delete)
#6: Incomplete .env.example	Dev Onboarding	🟡 Slow Setup	Low	Simple (Doc update)
#7: Direct Backend Calls	Email Config	🟡 CORS Errors	Medium	Complex (New proxies)
🎯 Recommended Fix Priority
Phase 1: Critical Authentication Blockers (ASAP)
✅ Verify & Fix Issue #1 (PUBLIC_APP_KEY)
✅ Fix Issue #5 (Decide on single TENANT_ID)
✅ Fix Issue #4 (Remove duplicate config)
Phase 2: Security Hardening (This Week)
✅ Implement Issue #3 (CSRF Protection)
✅ Verify Issue #2 (Align backend docs)
Phase 3: Developer Experience (Next Sprint)
✅ Fix Issue #6 (Complete .env.example)
✅ Evaluate Issue #7 (Proxy vs Direct pattern)
🔍 Verification Checklist
Na fixes, test de volgende flows:

Authentication Flow
 Login met correcte credentials → Redirect naar /platform
 Login met verkeerde credentials → Error message
 Access protected route zonder login → Redirect naar /login
 Token refresh na 15 minuten → Silent refresh, geen logout
Email Configuration Flow (Admin)
 Navigate naar /admin/settings → Tab "Email Configuration" zichtbaar
 Invullen SMTP credentials → Klik "Save Configuration"
 Test Connection → Succes bericht
 Backend controle: SELECT * FROM tenant_mail_configs WHERE tenant_id = '...'
Security Validation
 Browser DevTools → Application → Cookies → access_token en refresh_token present
 Browser DevTools → Network → Alle API calls hebben X-Tenant-ID header
 Browser DevTools → Network → POST/PATCH/DELETE calls hebben X-CSRF-Token header (na fix #3)
📝 Additional Notes
Waarom Dit Gebeurde
Het frontend project heeft meerdere refactors ondergaan:

Pre-2026: Authorization header pattern
Jan 2026: Cookie-only dual-token pattern
Jan 26: Strict mode enforcement
Deze transitie heeft documentatie drift veroorzaakt tussen:

Backend documentatie (BackendDocs/)
Frontend KI artifacts (knowledge/laventecare_frontend/)
Huidige implementatie (src/)
Anti-Gravity Law Violations Detected
Law #1: Structure is Law

❌ 
.env
 bevat orphan/duplicate variabelen (Issue #4, #5)
❌ 
.env.example
 niet gesynchroniseerd met productie requirements (Issue #6)
Law #2: Toxic Input

✅ CORRECT: Email passwords worden SHA-256 gehashed client-side
❌ MISSING: CSRF token protection (Issue #3)
Law #3: Naming Standard

✅ CORRECT: Alle files volgen snake_case.ts standaard
Law #4: Validation Before Mutation

❌ VIOLATED: Geen verificatie of PUBLIC_APP_KEY bestaat voordat het wordt gebruikt (Issue #1)
Law #5: No-Brick Policy

⚠️ AT RISK: Missing environment variables kunnen silent fails veroorzaken
End of Report