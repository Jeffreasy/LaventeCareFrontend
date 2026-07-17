# LaventeCare Frontend

Publieke LaventeCare-site voor `laventecare.nl` (Nederlands) en `laventecare.com` (Engels). De applicatie draait server-side op Astro, gebruikt React alleen voor interactieve islands en benadert LaventeCareAuthSystems uitsluitend via dezelfde-origin `/api`-routes.

## Vereisten

- Node.js 22.12 of hoger
- npm met een lockfile-compatibele versie
- Een bereikbare LaventeCareAuthSystems-instance

## Lokaal starten

```bash
npm ci
npm run dev
```

De ontwikkelserver luistert standaard op `http://localhost:4321`.

Maak een niet-getrackte `.env` op basis van `.env.example`:

```dotenv
PUBLIC_API_URL=https://auth.example.com
PUBLIC_TENANT_ID=00000000-0000-4000-8000-000000000000
PUBLIC_JWT_ISSUER=https://auth.example.com
PUBLIC_JWT_AUDIENCE=laventecare-frontend
```

`PUBLIC_API_URL` en `PUBLIC_JWT_ISSUER` moeten in productie een HTTPS-origin zonder credentials, query, fragment of basepath zijn. Plain HTTP is alleen toegestaan voor een loopback-adres in development. `PUBLIC_TENANT_ID` moet een geldige UUID zijn; er bestaat geen impliciete fallback-tenant.

## Commando's

```bash
npm run format:check
npm run lint
npm run type-check
npm run test
npm run build
```

CI voert daarnaast een actuele-tree secretscan en `npm audit --omit=dev --audit-level=high` uit.

## Architectuur

- Astro 7.1 met `@astrojs/vercel` 11 en server-output.
- React 19 voor het contactformulier, login/MFA en beheerinterfaces.
- Tailwind CSS 4 via de Vite-plugin.
- Hostgebaseerde locale: `.nl` is Nederlands, `.com` is Engels.
- Same-origin BFF onder `/api`; browsercode praat niet rechtstreeks met de auth-origin.
- RS256-JWT-verificatie in middleware met expliciete issuer, audience, scope, tenant en beheerdersrol.
- Eén HttpOnly refreshcookie op `Path=/api`; vernieuwing is single-flight.
- Tijdelijke auth-storingen (netwerk, 429, 5xx) bewaren de sessie. Alleen expliciete 400/401/403-responses maken de sessie ongeldig.
- Publieke contactrequests gebruiken een idempotente `requestId` en komen via AuthSystems bij de private intakebridge terecht.

Zie [docs/INDEX.md](docs/INDEX.md) voor de documentstatus en [docs/READINESS_STATUS_2026-07-17.md](docs/READINESS_STATUS_2026-07-17.md) voor de actuele auditreconciliatie.

## Belangrijke mappen

```text
src/components/   Astro-blokken, UI-primitives en React-islands
src/layouts/      sitebrede layout, SEO en locale-integratie
src/lib/          API-client, runtimeconfig, i18n en securityhelpers
src/pages/        pagina's en same-origin API-routes
tests/            Playwright functionele en regressietests
FrontendDocs/     historische en aanvullende ontwerpdocumentatie
docs/             canonieke documentindex en actuele status
```

## Contactflow

Het formulier verstuurt naam, e-mail, projecttype, bedrijf, budget, tijdlijn, doel, optioneel telefoonnummer, bron, pagina-URL en een stabiele `requestId` naar `/api/v1/public/contact`. Een retry zonder inhoudelijke wijziging hergebruikt dezelfde sleutel; na een wijziging wordt een nieuwe sleutel gemaakt. Publieke 401-responses starten nooit een sessierefresh.

AuthSystems valideert origin en tenant, reserveert de idempotentiesleutel duurzaam, zet e-mails in de outbox en forwardt LaventeCare-originverkeer naar de Homeapp-intake. Zie de AuthSystems-documentatie voor de bridge-secret en migraties.

## Deploy

De beoogde runtime is Vercel. Voor productie zijn minimaal vereist:

1. Node 22.12+ en de vier `PUBLIC_*` variabelen hierboven.
2. DNS/hostrouting voor `.nl` en `.com`.
3. AuthSystems-migraties en toegestane origins voor beide domeinen.
4. Een unieke intake-secret van minimaal 32 tekens aan beide serverzijden.
5. Werkende SMTP-configuratie per tenant.

Secrets, productiecredentials en private sleutels horen uitsluitend in de deployment-secretstore. Publiceer pas na de checks in de readinessstatus en een echte end-to-end test op de productie-infrastructuur.
