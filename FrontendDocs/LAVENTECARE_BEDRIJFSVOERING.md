# LaventeCare — Bedrijfsvoering (Waarheidsmap)

> **Bron van waarheid:** `JeffriesHomeapp/lib/laventecare/*` (canonieke bedrijfsdefinitie) + `JeffriesBackend/backend/internal/**` (CRM/facturatie/mail runtime).
> **Doel:** één actuele beschrijving van wat LaventeCare *als bedrijf* is en doet, om de publieke site (`LaventeCareFrontend`) mee bij te werken.
> **Opgesteld:** 2026-07-06 — afgeleid uit code, niet uit marketing.
> **Vervolg:** zie `LAVENTECARE_FRONTEND_READINESS_AUDIT.md` voor de diepe audit (verdict AMBER, pagina-voor-pagina diff, portfolio-verificatie, open beslissingen).
> ⚠️ **Let op:** AuthSystems-mailtemplates dragen een conflicterende identiteit ("Lavente Care V.O.F.", KvK 94908427). Canoniek is de eenmanszaak **LaventeCare, KvK 88162710** — te bevestigen door Jeffrey.

---

## 0. TL;DR — wat LaventeCare is

LaventeCare is een **B2B systeempartner voor mkb-organisaties** (eenmanszaak van Jeffrey Lavente, Dronten). De propositie: bedrijven van een professionele online basis naar een digitaal systeem brengen dat werk uit handen neemt. Compacte websites gebruiken een vaste Fast Track; proces- en systeemvragen gebruiken **intake → discovery → blueprint → realisatie → SLA-beheer → doorontwikkeling**. LaventeCare is daarmee meer dan een standaard websitebouwer: één vaste partner die techniek laat meegroeien met het bedrijf.

**Tagline:** *"Van idee tot werkend systeem."*

> ⚠️ **Correctie op eerdere aanname:** LaventeCare is **geen "zorg-consultancy"**. Die framing stond fout in het (verouderde) `JeffriesHomeapp/LAVENTECARE_MAP.md` (2026-06-23). De canonieke definitie in `lib/laventecare/profile.ts` is expliciet *B2B systeempartner voor mkb / digitale groei, automatisering en maatwerksoftware*. "Care" is merknaam + achtergrondverhaal (Jeffrey's NAH-zorg-achtergrond), niet de sector die bediend wordt.

---

## 1. Identiteit & juridische/contactgegevens

Bron: `JeffriesHomeapp/lib/laventecare/profile.ts`

| Veld | Waarde |
|---|---|
| Naam / legal name | **LaventeCare** |
| Eigenaar | **Jeffrey Lavente** |
| Rol | Systems engineer & oprichter |
| Website | https://www.laventecare.nl |
| E-mail | jeffrey@laventecare.nl |
| Telefoon | +31 6 39 03 40 85 |
| Locatie | Dronten, Nederland (Spiegelstraat 6, 8251 ZB — bron: site JSON-LD) |
| **KVK** | **88162710** |
| **BTW-ID** | **NL004553268B57** |
| Merkkleuren | primary **#0D7C5F** (groen), accent **#0891B2** (teal) |

**Kernbelofte:** "Van losse tools en handmatig werk naar een schaalbaar digitaal systeem: intake, analyse, blueprint, realisatie, beheer en doorontwikkeling."

**Doelgroep:** mkb, dienstverleners en operationele teams met terugkerende processen, klantcontact, administratie, planning, reporting of digitale groei-vraagstukken.

**Positie:** professionele websites als toegankelijk instapproduct, met een duidelijke groeiroute naar klantenwerving en maatwerksystemen. Geen pagebuilder-leverancier of eenmalige freelancer, maar een structurele partner.

**Samenvatting:** "LaventeCare bouwt systemen die bedrijven efficiënter maken, fouten voorkomen en groei versnellen: AI, IoT, maatwerkplatformen, lead generation en security-first systemen."

**Proof points:** 6+ live projecten · tot 99/100 Google Lighthouse · <1,5s gemiddelde laadtijd · SLA-managed beheer mogelijk.

**Security-filosofie:** *"Silence is Golden, the Database is a Fortress."*
Principes: Input is Toxic · Silence is Golden · The Database is a Fortress · Race Conditions are Fatal · Dependency Paranoia.

---

## 2. Diensten (het échte aanbod)

Bron: `lib/laventecare/types.ts` (`LaventeCareServiceId`) + `lib/laventecare/documents.ts` (services-tags)

Zes kern-dienstlijnen:

| # | Service-id | Dienst | Kern |
|---|---|---|---|
| 1 | `consultancy` | **IT Advies & Consultancy** | Losse analyse, advies, sparring, systeemkeuzes, digitale strategie — zonder bouwverplichting |
| 2 | `ai` | **AI & Automatisering** | Workflow-laag voor triage, samenvatting, opvolging, procesversnelling (human-in-the-loop) |
| 3 | `iot` | **IoT & Slimme Monitoring** | Signalering, operationele sensordata, slimme feedback uit fysieke processen |
| 4 | `platforms` | **Maatwerkplatformen** | Systeemimplementatie van blueprint naar werkend B2B-platform (single source of truth) |
| 5 | `leadgen` | **Lead Generation & Conversie** | Digitale groei, klantflows, conversiepunten, leadopvolging, website/SEO |
| 6 | `security` | **Security-first & AVG** | Zero-Trust, data-isolatie, verwerkersovereenkomst, privacy by design |

### 2.1 Productized instapaanbod: websites

Websites vormen **geen zevende kern-dienstlijn**, maar een vaste instaproute vóór `leadgen` en `platforms`.

| Pakket | Prijs excl. btw | Vaste grens |
|---|---:|---|
| Website Start | €750 | Complete responsive one-page website, klant levert inhoud aan |
| Website Business | €1.000 | Maximaal drie pagina's, één veilig formulier en transactionele bevestiging |
| Website Maatwerk | vanaf €1.500 | Unieke richting en afwijkende secties; vaste offerte na intake |
| Website Care Start | €29/maand | Hosting, SSL, bewaking en technische updates; inhoudelijke wijzigingen apart |
| Website Care Business | €49/maand | Website Care plus bewaking van formulier en transactionele e-mail |
| Website Care Maatwerk | vanaf €75/maand | Maatwerkhosting, bewaking en technische continuïteit |

Accounts, dashboards, betalingen, databases, uitgebreide offerteflows en procesautomatisering vallen buiten deze pakketten. Die vragen gebruiken het normale systeemtraject.

---

## 3. Prijsmodel

Bron: `lib/laventecare/pricing.ts`

| Onderdeel | Prijs | Toelichting |
|---|---|---|
| IT advies & consultancy | **€95 / uur** | Losse analyse, advies, sparring, systeemkeuzes |
| Website Start | **€750** | Vaste Fast Track, one-page, inhoud door klant aangeleverd |
| Website Business | **€1.000** | Tot drie pagina's, veilig formulier en transactionele e-mails |
| Website Maatwerk | **vanaf €1.500** | Afwijkende visuele of inhoudelijke richting |
| Website Care Start | **€29 / maand** | Beheerde websitehosting, SSL, bewaking en technische updates |
| Website Care Business | **€49 / maand** | Inclusief bewaking van formulier en transactionele e-mail |
| Website Care Maatwerk | **vanaf €75 / maand** | Maatwerkhosting, bewaking en technische continuïteit |
| Discovery traject | **€500 – €1.500** | Afhankelijk van complexiteit, aantal systemen, interviews |
| Implementatie | **Maatwerk** | O.b.v. blueprint, scope, integraties, risico, planning |
| SLA Essential | **€75 / maand** | Basis support & klein onderhoud |
| SLA Professional | **€150 / maand** | Proactief beheer, monitoring, snellere opvolging |
| SLA Enterprise | **vanaf €300 / maand** | Maatwerk voor kritieke/complexe omgevingen |

> Op de site aanvullend gecommuniceerd (consistent met de bron): **40/40/20 mijlpaal-facturatie** voor realisatie, en **IoT-koppeling vanaf €2/apparaat/maand**.
> ⚠️ Interne noot: backend `lc_time_entries.hourly_rate_cents` staat default op **7500 (€75/u)**, terwijl het gecommuniceerde consultancy-tarief **€95/u** is — controleren of dit klopt.

---

## 4. Werkwijze (6-fasen proces)

Bron: `lib/laventecare/process.ts`

**Vaste uitzondering — Website Fast Track:** gratis afstemming → inhoud compleet → bouw en controle → gebundelde feedback → livegang. Een betaald Discovery- en Blueprinttraject is alleen nodig wanneer de vraag buiten de vaste websiteafbakening valt.

| Fase | Doel | Output |
|---|---|---|
| **1. Intake** | Kwalificeren of er een echte businesscase is (probleem, urgentie, impact, eigenaarschap, budget) | Fit/no-fit, eerste scope, vervolgstap |
| **2. Discovery** | Huidige situatie, systemen, workflows, knelpunten, risico's en kansen in kaart | Systeemanalyse met proceskaart, prioriteiten, requirements |
| **3. Blueprint** | Oplossingsrichting → architectuur, fasering, deliverables, planning, beslispunten | Blueprint als leidend projectdocument |
| **4. Realisatie** | Bouwen, testen, opleveren, overdraagbaar maken (gecontroleerde scope + changelog) | Werkend systeem + documentatie + acceptatie |
| **5. SLA & beheer** | Support, monitoring, incidenten, wijzigingsverzoeken, continuïteit | Afspraken over responstijden, onderhoud, opvolging |
| **6. Doorontwikkeling** | Periodiek verbeteren op basis van data, feedback, groeidoelen | Roadmap, optimalisaties, nieuwe iteraties |

---

## 5. Kwalificatie — Fit / No-fit

Bron: `lib/laventecare/fit.ts`

**Wél een fit:**
- Compacte bedrijfswebsite met complete inhoud en bereidheid om binnen een vast pakket te werken
- Concreet bedrijfsproces dat tijd, fouten, omzet of klantbeleving raakt
- Klant heeft eigenaarschap (iemand kan beslissen, prioriteren, feedback geven)
- Bereidheid om discovery en blueprint serieus te doen wanneer de vraag verder gaat dan een vast websitepakket
- Vraag om een systeem/workflow, niet alleen losse styling of eenmalige aanpassing
- Ruimte voor onderhoud, documentatie en doorontwikkeling na oplevering

**Geen fit:**
- Een vaste websiteprijs verwachten terwijl inhoud, pagina's en functies open blijven staan
- Geen duidelijke eigenaar, budgetrichting of beslismoment
- Bouwen zonder analyse terwijl het probleem nog onduidelijk is
- Structureel support-intensief zonder passende SLA

---

## 6. Documentensuite (commercieel apparaat)

Bron: `lib/laventecare/documents.ts` — **27 documenten**, versie `2026-04`, in 3 categorieën. Voedt de PDF-generator (`lib/laventecare/pdf/*`) en de backend-kennisbank (`lc_documents`).

- **Commercieel** (kwalificatie/advies/proof/voorstel): Introductie, IT Advies & Consultancy, Lead Generation & Conversie, AI & Automatisering, IoT & Slimme Monitoring, Wanneer Past LaventeCare, Fit Check, Case Study Digitale Groei, Prijzen & Investering, Voorstel Template.
- **Proces & delivery**: Werkwijze Discovery & Blueprint, Discovery Intake Werkblad, Discovery Systeemanalyse, Fase 2 Systeemimplementatie, Huidige Situatie Audit, SEO & Website Audit, Scope & Deliverables, Klant Onboarding, System Evolution Plan.
- **Governance & legal**: Decision Log, Change Request, Algemene Voorwaarden, Verwerkersovereenkomst, SLA Agreement, Privacyverklaring, Security One-Pager.

**Zichtbaarheid:** `public` / `send_only` / `internal` / `contract`.
**Legal stack (juridische ruggengraat):** Voorstel · Blueprint · Scope & deliverables · Verwerkersovereenkomst · SLA Agreement · Algemene voorwaarden · Privacyverklaring · Security one-pager.

---

## 7. Klantcommunicatie — 13 branded mailtemplates

Bron: `JeffriesBackend/backend/internal/store/laventecare_mailbox.go`

Volledige klant-lifecycle, verstuurd via Microsoft Graph vanaf `jeffrey@laventecare.nl`, ondertekend **"Jeffrey Lavente / LaventeCare"**: intake-reply, offerte, factuur, betalingsherinnering, projectupdate, oplevering/overdracht, documentatie-verzending, meeting-samenvatting, support/SLA-update, change-request-bevestiging. Toon: zakelijk, gestructureerd, klantdossier-gedreven, altijd met een expliciete "volgende stap".

---

## 8. Systeemlandschap (waar de bedrijfsvoering draait)

| Project | Rol |
|---|---|
| **JeffriesHomeapp** (Next.js) | Interne cockpit/CRM-UI + PDF-generator. `lib/laventecare/` = canonieke bedrijfsdefinitie. Praat met de Go-backend via `/api/backend` proxy. |
| **JeffriesBackend** (Go + PostgreSQL) | API + automation-engine. `lc_*` schema: companies, contacts, leads, projects, workstreams, quotes/invoices, time-entries, mail, documents, governance. AI-agent `laventecare`, Telegram, integraties. |
| **LaventeCareAuthSystems** | Auth + website-intake-bridge → zet website-contact om in een LaventeCare-lead (`convex.site/laventecare/intake`, idempotent op userId+bron+sourceId). |
| **LaventeCareFrontend** (Astro) | **De publieke marketingsite** — dit is degene die bijgewerkt moet worden. |

**Integraties (backend):** bunq (betaalverzoeken/facturen), Microsoft Graph (branded mailbox), Google Gmail/Calendar (business-signaalscanner), Telegram-bot (`/laventecare`, `/lc`, `/focus`), Grok/xAI (mail-concepthulp), AES-GCM secret-encryptie voor klant-logins.

---

## 9. Wat er op de publieke site (LaventeCareFrontend) niet meer klopt

Gerangschikt naar impact. (✅ = al goed op de site.)

| # | Onderdeel | Site zegt nu | Waarheid (bron) | Ernst |
|---|---|---|---|---|
| 1 | **Positionering/toon** | "High-End Systeem- & Architectuurpartner", zwaar *enterprise / één engineer / Zero-Trust / antigravity / worker-mesh* | "**B2B systeempartner voor mkb**", nuchter, "structurele partner" | **Hoog** |
| 2 | **Tagline** | "Van idee tot productie" (`werkwijze.astro`), geen vaste tagline op home | Canoniek: **"Van idee tot werkend systeem"** | **Hoog** |
| 3 | **KVK / BTW** | Niet vermeld op site/footer | KVK **88162710**, BTW **NL004553268B57** | **Hoog** (verplicht + vertrouwen) |
| 4 | **Diensten-set** | 5 home-pijlers, "consultancy" ontbreekt als eigen pijler | 6 canonieke diensten incl. losse **consultancy** | Middel |
| 5 | **Doelgroep** | Impliceert enterprise ("Budget vanaf €3.000") | Expliciet **mkb / dienstverleners / operationele teams** | Middel |
| 6 | **Encoding-bug** | `werkwijze.astro`: mojibake `Ã¢â‚¬â€œ` / `Ã¢â‚¬â€ ` in titel + teksten | Moet em-dash `—` / `–` zijn | Middel (zichtbaar kapot) |
| 7 | **Merkkleur** | `--color-active` = teal #0891B2 (= accent); groene primary #0D7C5F wordt nergens gebruikt | Profiel definieert primary **groen** + accent teal | Laag |
| 8 | **Docs-handbook** | `FrontendDocs/docs/README.md` belooft "perfect Lighthouse scores" als feature | Lighthouse-gauges verwijderd (commit `f720ff6`); "tot 99/100" is wél een echte proof point | Laag |
| 9 | ✅ **Prijzen** | €95/u, €500–1.500, SLA €75/€150/€300+, 40/40/20 | Komt overeen met `pricing.ts` | — |
| 10 | ✅ **Werkwijze** | 4–5 fasen (advies→intake→discovery/blueprint→realisatie→SLA) | Komt grofweg overeen met de 6 fasen (site voegt discovery+blueprint samen) | — |

---

## 10. Besluiten en openstaande vragen

**Besloten op 24 juli 2026:**

1. De publieke positionering blijft **B2B systeempartner voor mkb — van idee tot werkend systeem**.
2. Professionele websites worden een scherp, productized instapaanbod vanaf €750. Dit vervangt de systeempositionering niet.
3. Consultancy blijft een zelfstandige kern-dienstlijn voor €95 per uur.
4. De intake toont aparte budgetstappen voor websites en maatwerksystemen.

**Nog open:**

1. **NAH-zorg-verhaal:** blijft dit het merkverhaal op `/over`, of naar de achtergrond?
2. **Uurtarief-discrepantie:** €95/u (extern) vs €75/u (backend default) — welke is leidend?
3. **Merkkleur:** groen (#0D7C5F) terugbrengen als primary, of teal (#0891B2) als het echte merk aanhouden?
