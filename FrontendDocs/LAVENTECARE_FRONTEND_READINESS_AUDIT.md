> **Historical point-in-time audit (2026-07-06).** Most repository-fixable findings have since been addressed. See `docs/READINESS_STATUS_2026-07-17.md` for the current reconciliation and external release gates.

# LaventeCare — Frontend Readiness Audit (2026-07-06)

> Diepe audit: is de canonieke bedrijfsdata compleet/consistent en **bruikbaar om de marketingsite mee te herbouwen**? Bron van waarheid = `JeffriesHomeapp/lib/laventecare/*`. Live pagina's = `LaventeCareFrontend/src/pages/*`. Portfolio geverifieerd tegen de echte project-repos onder `Desktop/Projecten/*`.

## 1. Verdict

**AMBER — bruikbaar als data-baseline, NIET om de site as-is mee te herbouwen.**

De canonieke bedrijfsdata (`JeffriesHomeapp/lib/laventecare/*`) is compleet, intern coherent en voldoende om identiteit, prijzen, proces, fit, security, SLA en legal-content mee te vullen. Maar de **live site wijkt af van die canon** op positionering, aantal diensten en portfolio-feiten, bevat **gepubliceerde defects** (mojibake, kapotte tech-tags, half afgeronde Lighthouse-verwijdering) en draagt **onverifieerbare/verzonnen marketingclaims**. Je kunt niet herbouwen door huidige site-copy over te nemen — je moet herbouwen *vanuit de canon* en de site corrigeren.

**Blockers (op te lossen vóór rebuild):**

1. **Positionering onopgelost.** Canon = "B2B systeempartner voor mkb-organisaties", expliciet "Geen losse websitebouwer of eenmalige freelancer." Elke live pagina brandt als "High-End Systeem- & Architectuurpartner … door één engineer" en `/over` verdubbelt op een solo-founder + "AI als bouwteam"-verhaal. Tegenstrijdige verhalen. Jeffrey moet kiezen (§7).
2. **Dienstenmodel mismatch: 6 vs 5.** Canon/`types.ts` = 6 diensten (consultancy, ai, iot, platforms, leadgen, security). Site levert **5 pijlers**; consultancy heeft geen dienstpagina, en NL vs EN homepages tonen *verschillende* pijler-sets.
3. **Portfolio tech-stacks feitelijk fout op 4 van 7 projecten** (geverifieerd tegen de echte repos): C&F Bouw, TuinHub, Whisky for Charity en JeffDash adverteren stacks die de repos niet gebruiken. Eén capability is **verzonnen** (SmartCoolCare "24/7 Automatische SMS Alerts" — geen SMS-code aanwezig).
4. **Gepubliceerde encoding- + component-defects.** `werkwijze.astro` en `services/lead-generation.astro` bevatten mojibake. Drie portfolio-pagina's tonen nog Lighthouse-gauges ná commits `f720ff6`/`a1c5d3a` die "complete removal" claimden.
5. **Interne tegenstrijdigheden in dragende feiten:** oprichtingsjaar (2022 vs 2023 op `/over`), SLA Enterprise responstijd (1u vs 4u binnen `prijzen.astro`), en merkkleur (marketing-groen `#0D7C5F` vs teal `#0891B2`/`#0F766E` vs backend-tenant `#ff6b00`).

Los de vijf blockers op en corrigeer de reconciliatielijst → GREEN.

---

## 2. Frontend-klaar contentmodel

Geautoriseerde, ontdubbelde dataset. Bron = canoniek `lib/laventecare/*` tenzij vermeld. Dit is wat een content-bestand zou moeten encoderen.

### 2.1 Identiteit / legal

| Veld | Waarde | Bron |
|---|---|---|
| Handelsnaam | LaventeCare (één woord) | `profile.ts` (`legalName='LaventeCare'`, geen rechtsvorm-suffix) |
| Rechtsvorm | Eenmanszaak (ZZP) | `over.astro` Bedrijfsgegevens |
| Eigenaar | Jeffrey Lavente | `profile.ts` |
| KVK | 88162710 | `profile.ts`, bevestigd `over/voorwaarden/terms` |
| BTW | NL004553268B57 | `profile.ts` (⚠ staat op GEEN live pagina) |
| Adres | Spiegelstraat 6, 8251 ZB Dronten, Flevoland, NL | `index.astro` JSON-LD |
| E-mail | jeffrey@laventecare.nl | `profile.ts`, alle pagina's |
| Telefoon | +31 6 39 03 40 85 | `profile.ts` (⚠ alleen in JSON-LD, nooit getoond op `/contact`) |
| Primair domein (NL) | https://www.laventecare.nl | `profile.ts` |
| Secundair domein (EN) | https://www.laventecare.com | alleen site — **niet in canon, onverifieerbaar** |
| Oprichtingsdatum | ⚠ **ONOPGELOST** (2022 vs 2023) | zie §5 |

> ⚠ De AuthSystems-mailtemplates dragen een **conflicterende identiteit**: "Lavente Care V.O.F.", KvK **94908427**, tagline "Digitale oplossingen van Chip tot Cloud", app_url `lavente.care`. Dit is een *andere rechtspersoon en merkstem* dan de canonieke `LaventeCare` eenmanszaak (KVK 88162710). Moet worden opgelost vóór enige legal/footer-copy vertrouwd wordt (`AuthSystems/.../html/laventecare/base.html:218`).

### 2.2 Positionering + tagline (canoniek — VERVANGT huidige site-copy)

| Veld | Canonieke waarde | Bron |
|---|---|---|
| Rol | "B2B systeempartner voor mkb-organisaties die digitale groei, automatisering en maatwerksoftware professioneel willen neerzetten." | `profile.ts` |
| Tagline | **"Van idee tot werkend systeem."** | `profile.ts` (⚠ staat NERGENS live; site gebruikt variant "Van idee tot productie") |
| Positie | "Geen losse websitebouwer of eenmalige freelancer, maar een structurele partner die bedrijfsprocessen vertaalt naar werkende systemen." | `profile.ts` |
| Summary | "LaventeCare bouwt systemen die bedrijven efficiënter maken, fouten voorkomen en groei versnellen: AI, IoT, maatwerkplatformen, lead generation en security-first systemen." | `profile.ts` |
| Kernbelofte | "Van losse tools en handmatig werk naar een schaalbaar digitaal systeem: intake, analyse, blueprint, realisatie, beheer en doorontwikkeling." | `profile.ts` |
| Doelgroep | mkb, dienstverleners, operationele teams | `profile.ts` |

### 2.3 Zes diensten (id + naam + one-line + bedoelde toon)

| id | Canonieke naam | One-line | Bedoelde toon | Site-pagina nu |
|---|---|---|---|---|
| consultancy | IT advies & consultancy | Onafhankelijk sparringpartner / second opinion, zonder bouwverplichting (€95/u). | Nuchter, advies | **ONTBREEKT** (geen dienstpagina) |
| ai | AI & Automatisering | AI die repetitief werk overneemt en data benut voor snellere beslissingen — betrouwbaar en meetbaar. | Nuchter benefit; drop "prompt engineering"-jargon | `diensten/ai-prompt-engineering.astro` |
| iot | Slimme Monitoring & Sensoren | Van sensor tot dashboard: problemen vroeg signaleren, minder downtime. | Nuchter benefit | `diensten/iot-hardware.astro` |
| platforms | Maatwerk Platformen | Losse tools en handwerk vervangen door één schaalbaar systeem. | Nuchter; **de-niche van "Events"** | `diensten/maatwerk-platformen.astro` |
| leadgen | Lead Generation | Website wordt een systeem dat bezoekers omzet in aanvragen. | Nuchter; **breder dan bouw/trades** | `diensten/lead-generation.astro` |
| security | Beveiliging & Authenticatie | Multi-tenant data-isolatie, RBAC, audit trails — security-first. | ⚠ Site over-productiseert als "Anti-Gravity"/"AuthSystem" | `diensten/security.astro` |

### 2.4 Prijstabel (canon-bevestigd door `pricing.ts`; site komt overeen)

| Item | Prijs | Noot |
|---|---|---|
| IT Advies / Consultancy | €95/uur | Eerste gesprek gratis; Change Requests €95/u |
| Discovery & Blueprint | €500 – €1.500 | Eenmalig, vaste fee (excl. BTW) |
| Realisatie | Vaste projectprijs | Milestone **40/40/20** (site-toevoeging, in `terms` Art. 5) |
| IoT koppeling | Vanaf €2/device/maand | Site-toevoeging |
| SLA Essential | €75/maand | |
| SLA Professional | €150/maand | Aanbevolen |
| SLA Enterprise | Vanaf €300/maand | ⚠ responstijd-claim tegenstrijdig — zie §5 |

### 2.5 Zes-fasen proces (canoniek `process.ts`)

| # | Canoniek label | Interne key | Site (5-fasen) equivalent |
|---|---|---|---|
| 1 | Intake | `intake` | Fase 1 Kennismaking & Intake (Gratis, 30 min) |
| 2 | Discovery | `discovery` | Fase 2 Discovery & Blueprint (€500–€1.500, 1-2 wkn) |
| 3 | Blueprint | `blueprint` | (samengevouwen in Fase 2) |
| 4 | Realisatie | `realisatie` | Fase 3 Ontwikkeling & Oplevering (40/40/20, 2-6 wkn) |
| 5 | SLA en beheer | `sla` | Fase 4 SLA & Doorontwikkeling (vanaf €75/mnd) |
| 6 | Doorontwikkeling | `evolution` | (samengevouwen in Fase 4) |

> Interne keys zijn `sla`/`evolution`, niet canon-labels. Site vouwt 6→5 (Fase 0 "IT Advies" is een voorafgaande optionele fase, niet één van de 6). Beslis: 6 canonieke stappen tonen of de 5-fasen timeline houden.

### 2.6 Fit / no-fit (`fit.ts` — 5 fit + 4 no-fit; site-copy bruikbaar)

| Fit (ideale match) | No-fit (doorverwijzing) |
|---|---|
| Concreet bedrijfsproces dat tijd/fouten/omzet/klantbeleving raakt | Alleen goedkope website zonder procesvraag |
| Eigenaarschap: iemand kan beslissen/prioriteren | Geen eigenaar, budgetrichting of beslismoment |
| Bereid tot serieuze discovery + blueprint | Bouwen zonder analyse, probleem onduidelijk |
| Vraagt om systeem/workflow, niet losse styling | Structureel support-intensief zonder SLA |
| Ruimte voor onderhoud + doorontwikkeling | |

> ⚠ De site voegt een "budget vanaf €3.000" instapgrens toe (`werkwijze`/`how-we-work`) die **niet** in `fit.ts` staat — bevestigen of dit een echte, bedoelde kwalificatie is.

### 2.7 Proof points (`profile.ts`)

- "6+ live projecten"
- "Tot 99/100 Google Lighthouse" ⚠ **verwijderd uit live UI** (commit `f720ff6`) maar nog in canon — beslis (§5)
- "<1.5s gemiddelde laadtijd"
- "SLA-managed beheer mogelijk"

### 2.8 Security-principes (`profile.ts` — **5**, niet 4)

1. Input is Toxic
2. Silence is Golden
3. The Database is a Fortress
4. Race Conditions are Fatal
5. Dependency Paranoia

> Presenteer als 5 nuchtere principes. **Niet** de site-framing "Anti-Gravity Beveiligingsprincipes", "LaventeCare Core" of het "Self-Healing Worker Mesh"-telemetrie-widget als canoniek shippen — die hebben geen basis in canon (§5).

### 2.9 SLA-severities P1–P4 (`pdf/structured.ts` — NIEUW, autoritatief)

| Severity | Definitie (verbatim) |
|---|---|
| P1 | "P1 is volledige uitval of bedrijfskritieke stagnatie." |
| P2 | "P2 is zware degradatie met workaround." |
| P3/P4 | "P3/P4 zijn beperkte of cosmetische problemen." (samengevouwen — geen aparte P3 vs P4 copy) |

SLA = inspanningsverplichting: "Richtwaarden gelden als inspanningsverplichting, tenzij het pakket of contract expliciet een harde SLA noemt." **Geen numerieke responstijd-uren in code — niet verzinnen** (de site "1u"/"4u"/"99.99% uptime garantie" zijn NIET canon-gedekt).

### 2.10 Legal doc-lijst (`documents.ts` — LEGAL_STACK, 8 items; catalogus-totaal = **27** niet 28)

Voorstel · Blueprint · **Scope en deliverables** · Verwerkersovereenkomst · SLA Agreement · Algemene voorwaarden · Privacyverklaring · Security one-pager. Versie **2026-04**. Rangorde (`pdf/structured.ts`): "Blueprint gaat boven voorstel, daarna DPA, SLA, scope en algemene voorwaarden."

### 2.11 Brand-tokens

| Token | Waarde | Bron | Status |
|---|---|---|---|
| Marketing primary | `#0D7C5F` (groen) | `profile.ts` | Canonieke web-primary |
| Marketing accent | `#0891B2` (teal) | `profile.ts` | Canonieke accent |
| PDF screen accent | `#0891B2` teal; bg `#0A1628` | `pdf/theme.ts` | Document-engine |
| PDF print accent | `#0F766E` | `pdf/theme.ts` | Print-only (3e teal) |
| Site theme-color | `#0C4A6E` | `Layout.astro` | ⚠ 4e blauw niet in canon |
| Backend tenant primary | `#ff6b00` (oranje) | AuthSystems seed | ⚠ 5e kleur, spreekt alles tegen |
| Fonts (site) | Geist + Satoshi | `Layout.astro` | vs PDF Outfit + Inter |

⚠ **Vijf verschillende merkkleuren door de stack.** Vereist een beslissing (§7).

---

## 3. Pagina-voor-pagina wijzigingslijst

### `src/pages/werkwijze.astro`
- **CRITICAL — Fix mojibake (4×).** `2Ã¢â‚¬â€œ6 weken`→`2–6 weken` (L36); title `Werkwijze Ã¢â‚¬â€ …`→`—` (L75); heading `… Ã¢â‚¬â€ volledige controle`→`—` (L95); `vÃƒÂ³ÃƒÂ³r aanvang`→`vóór` (L161).
- **MEDIUM — Tagline.** Header "Van idee tot productie" → canoniek "Van idee tot werkend systeem." (`profile.ts`).
- **LOW — Timeline-consistentie.** HowTo JSON-LD `totalTime P12W` vs body "2–6 weken" realisatie — uitlijnen.

### `src/pages/index.astro` (NL home)
- **CRITICAL — Positionering.** "High-End Systeem- & Architectuurpartner … door één engineer" → canonieke rol/positie (`profile.ts`), afhankelijk van §7.
- **CRITICAL — Portfolio-card tech-tags fout.** C&F Bouw toont `Astro/Convex/Go`; echte repo = Pure Astro + Convex + Go Auth (geen Next.js/Supabase). Home spreekt ook `/portfolio` index tegen (die zegt onterecht Next.js/Supabase). Reconcile naar repo-waarheid: **Astro 5 + Convex + LaventeCare Go Auth**.
- **HIGH — Pijlers 5→6.** Voeg consultancy toe of beslis expliciet het 5-pijler-model; NL pijler-set ≠ EN pijler-set.
- **HIGH — Onverifieerbare claims.** "99/100 Google PageSpeed (verifieerbaar)", "+340% organisch verkeer", "100% Uptime" — zie §6.
- **LOW — URL-hygiëne.** Home-card URLs `https://cfbouw.nl` (geen www) vs index `https://www.cfbouw.nl/`.

### `src/pages/en-index.astro` (EN home)
- **HIGH — Geen vertaling van NL.** Andere pijler-set en slechts 2 portfolio-projecten vs 4. Herbouw EN home als echte vertaling.
- **MEDIUM — priceRange `€€`** vs NL `€€€` vs `/prijzen` `€75-€300+/maand` — kies één encoding.

### `src/pages/over.astro`
- **CRITICAL — Oprichtingsdatum-tegenstrijdigheid.** "Opgericht 17 oktober 2022" vs Werkervaring "LaventeCare, 2023 – heden." Los op tot één jaar (§5).
- **HIGH — Positionering.** Solo-founder + "AI als mijn uitvoerende bouwteam" + calisthenics-narratief spreekt canon "structurele partner … geen eenmalige freelancer" tegen (§7).

### `src/pages/about.astro`
- **MEDIUM — Parity-gap.** Mist 3 `/over`-secties (AI-build-team, calisthenics, opleiding/werk-historie). Beslis de bedoelde EN-diepte.
- **MEDIUM — Oprichtingsdatum** herhaalt "17 October 2022".

### `src/pages/contact.astro`
- **HIGH — Toon telefoon.** +31 6 39 03 40 85 staat in canon en JSON-LD maar wordt nooit getoond. Voeg zichtbaar contact toe.
- **MEDIUM — Alleen NL, bedient .com.** Engelse bezoeker landt op NL-pagina; legal-link `/voorwaarden` heeft hier geen EN `/terms`-fallback.

### `src/pages/prijzen.astro`
- **CRITICAL — SLA-responstijd-tegenstrijdigheid.** Card "1u reactietijd" vs JSON-LD "max 4u reactietijd" in hetzelfde bestand. Fix JSON-LD naar 1u (EN klopt) OF verwijder numerieke claim (canon heeft geen).
- **HIGH — "99.99% uptime garantie (SLA)"** niet canon-gedekt; onderbouw of verzacht naar inspanningsverplichting.

### `src/pages/pricing.astro`
- **MEDIUM — BTW-parity.** Alleen EN Discovery zegt "excl. VAT"; voeg toe aan NL.

### security-dienstpagina's (`diensten/security.astro`, `services/security.astro`)
- **HIGH — De-productiseer.** "Anti-Gravity Beveiligingsprincipes" / "LaventeCare AuthSystem" / "LaventeCare Core" / "Self-Healing Worker Mesh" hebben geen canon-basis. Map naar de 5 nuchtere `security.principles`. EN-pagina mist de AntiGravityShield/LiveTelemetryPulse islands die NL rendert — beslis parity.
- **MEDIUM — `AVG-Compliant` badge** spreekt de eigen hedge tegen "Concrete AVG-compliance hangt af van contractuele afspraken." Verzacht badge.

### `src/pages/services/lead-generation.astro`
- **CRITICAL — Mojibake.** `â€"` (em-dash) en `â€¢` (bullet) in body, `<title>` en desc. Fix encoding.

### Portfolio-pagina's (`src/pages/portfolio/*`)
- **CRITICAL — Onvolledige Lighthouse-verwijdering.** `jeffdash.astro`, `tuinhub.astro`, `whisky-for-charity.astro` importeren/renderen nog `LighthouseScoreBlock` — spreekt commits `f720ff6`/`a1c5d3a` tegen. Whisky toont openlijk Performance 71. Verwijder of bewust houden (§5).
- **CRITICAL — Foute tech-stacks** op cf-bouw, tuinhub, whisky (Convex-claim onbewezen) en Dustin ("React 19" → eigenlijk 18.3.1). Zie §6 voor gecorrigeerde stacks.
- **HIGH — Verzonnen claim.** SmartCoolCare "24/7 Automatische SMS Alerts" — geen SMS-code. Verwijderen.
- **MEDIUM — Metric-oppervlakken oneens.** SmartCoolCare/JeffDash/Whisky tonen andere headline-metrics op home vs index vs case-pagina. Kies één set per project.
- **MEDIUM — Dustin heeft geen live URL** maar wel badge "In Productie."

### `src/pages/404.astro`
- **LOW — Alleen NL, bedient .com.** Voeg EN-variant toe.

### i18n / SEO (`src/lib/i18n/routes.ts`, `Layout.astro`, `SEO.astro`, `config.ts`)
- **HIGH — Portfolio-subpagina's hebben geen hreflang** (geen `/portfolio/*` in `NL_TO_EN_PATH`) → case studies emitten geen alternate-language links.
- **MEDIUM — OG-image inconsistentie.** `SEO.astro` `/og-image.png` (1200×630) vs `config.ts` Cloudinary vierkant logo.
- **LOW — Copyright hardcoded "© 2026"** op 3 plekken; verouderd na 2026.
- **LOW — Default meta** leidt nog met "AI Prompt Engineering"-framing (`config.ts`) vs nieuwere positionering.

---

## 4. Gaten die de bron NIET dekt (vers schrijven / aanleveren)

| Item | Wat ontbreekt | Wie lost op |
|---|---|---|
| Consultancy-dienstpagina copy | Geen positionering/benefit/feature-copy (alleen prijs €95/u). Vanaf nul schrijven. | **Jeffrey** (copy), daarna auteuren |
| Oprichtingsdatum | Canon heeft geen; site spreekt zichzelf tegen. | **Jeffrey** (autoritatieve datum) |
| Numerieke SLA-responstijden | Geen uren in enig canon-bestand; site "1u/4u" verzonnen. | **Jeffrey** (echte SLA-nummers of expliciet inspanningsverplichting) |
| P3 vs P4-onderscheid | Code vouwt "P3/P4" samen. | **Jeffrey** indien aparte tiers nodig |
| Klant-testimonials / social proof | Alle quotes staan uit-gecomment ("wacht op echte quotes"); enige echte naam Ferry Bouwman (C&F Bouw) in HTML-comment. Nul live social proof. | **Jeffrey** (quotes verkrijgen) |
| Portfolio metric-bewijs | Geen repo bevat rapporten/benchmarks voor "+340%", "100+", "€10K+", "Sub-100ms", "100% uptime", Lighthouse-gemiddelden. | **Jeffrey** (bewijs of nummers laten vallen) |
| .com domein-legitimiteit | `laventecare.com` niet in canon; EN JSON-LD wijst ernaar terwijl e-mail `.nl` blijft. | **Jeffrey** (bevestig domein) |
| NAH-zorg backstory | Canon zegt expliciet géén zorg-consultancy, maar `/over` leunt op NAH-zorg. Framing-beslissing. | **Jeffrey** (§7) |
| EN breadcrumb-labels | Portfolio-slug-labels alleen in `nl.ts`; bevestig `en.ts` mirror. | Auteuren (verifiëren) |
| Contactform extra velden | Backend accepteert `m2`, `postcode`, `website`; frontend `ContactPayload` laat ze weg. | Auteuren (indien intake ze nodig heeft) |
| BTW-weergave | `NL004553268B57` op geen pagina. | Auteuren (footer/legal) |

---

## 5. Interne inconsistenties (op te lossen)

| # | Tegenstrijdigheid | Aanbevolen oplossing |
|---|---|---|
| 1 | **Oprichtingsjaar:** `/over` "17 oktober 2022" vs werk-historie "2023 – heden" | Jeffrey bevestigt; lijn beide uit. KVK 88162710 is echt. |
| 2 | **SLA Enterprise responstijd:** `prijzen.astro` card "1u" vs JSON-LD "4u" (EN `/pricing` zegt 1h) | Fix NL JSON-LD naar 1u; maar canon heeft **geen** uren — idealiter herframe als inspanningsverplichting per `pdf/structured.ts`. |
| 3 | **Documentaantal:** eerdere map "28" vs `documents.ts` length **27** | Gebruik 27 (code is bron). |
| 4 | **Legal scope-item:** "Scope" vs code "Scope en deliverables" | Gebruik "Scope en deliverables". |
| 5 | **Security-principes:** 4 vs `profile.ts` **5** | Gebruik 5. |
| 6 | **Merkkleur:** groen `#0D7C5F` vs teal `#0891B2`/`#0F766E` vs site `#0C4A6E` vs backend `#ff6b00` | Jeffrey kiest canonieke primary (§7); lijn theme-color + backend tenant uit. |
| 7 | **Lighthouse-proof:** nog in `profile.ts` canon maar verwijderd uit live UI (`f720ff6`); nog gerenderd op 3 portfolio-pagina's | Beslis: volledig verwijderen of hedged "tot 99/100" houden. Nu half-af. |
| 8 | **PageSpeed vs Lighthouse-naam** + "tot"-hedge weggevallen in stats-bar ("99/100") | Standaardiseer term + houd "tot"-hedge. |
| 9 | **priceRange-encoding:** `€€€` / `€€` / `€75-€300+/maand` over 3 pagina's | Eén encoding sitewide. |
| 10 | **Positionering:** "één engineer" overal vs canon "geen eenmalige freelancer" | §7. |
| 11 | **5 pijlers vs 6 diensten**; NL pijlers ≠ EN pijlers | Beslis model; maak NL/EN identiek. |
| 12 | **Monitoring-productnaam:** "Observatory AI" (werkwijze/prijzen) vs "Sentry" (Dustin case) | Kies één canonieke monitoring-naam. |
| 13 | **Identiteitssplit (backend):** "Lavente Care V.O.F." KvK 94908427 / "Chip tot Cloud" vs canoniek "LaventeCare" eenmanszaak KVK 88162710 | Jeffrey bevestigt welke entiteit publiek is; de V.O.F. + KvK 94908427 in mailtemplates is een serieuze mismatch. |
| 14 | **Domeinsplit:** app_url `lavente.care` vs e-mail/bron `laventecare.nl` vs EN-site `laventecare.com` | Kies canoniek marketingdomein. |

---

## 6. Portfolio-verificatie

Alle 7 projecten mappen naar **echte repos**; geen verzonnen. Maar **4/7 misvertegenwoordigen de stack** en **elke gekwantificeerde metric is onverifieerbaar uit code**.

| Project | Repo | Echt? | Stack op site | Oordeel |
|---|---|---|---|---|
| De Koninklijke Loop | `De-koninklijkeloop` | ✅ | Astro/React19/Convex/Go Auth/Vercel | **Stack KLOPT.** Best-matched. Metrics ("100+", "93 avg Lighthouse", "0 downtime") onverifieerbaar; event-datum 16 mei 2026 nu verleden. |
| SmartCoolCare | `SmartCoolCare` | ✅ | C++/ESP32/BLE/Convex/React | **Stack KLOPT.** ⚠ "24/7 SMS Alerts" **VERZONNEN** (geen SMS/Twilio-code). "Sub-100ms ingest"/"100% uptime" onverifieerbaar & misleidend (firmware deep-sleept 60–300s). |
| C&F Bouw | `CnFBouws` | ✅ | Next.js/Supabase/Resend | **STACK FOUT.** Repo = Pure Astro + Convex + Go Auth, expliciet "zonder React". "+340%" onverifieerbaar. |
| Dustin Auto Garage | `DustinOpzet` | ✅ | Astro/React**19**/Convex/Go Auth/RDW | **Grotendeels correct.** RDW-proxy + xAI Grok Vision OCR zijn **echt in code**. Maar React is **18.3.1**, niet 19. Geen live URL. |
| Whisky for Charity | `WhiskyforcharityV2` | ✅ | Astro/**Convex**/HTML Email/Vercel | **Convex ONBEWEZEN** (geen convex-dep/folder; minimale Astro-starter + CheckoutModal). "€10K+"/"0 failed transactions" onverifieerbaar, geen payment-provider in code. |
| TuinHub | `Hovenier` (pkg `tidal-tower`) | ✅ | Next.js/Supabase/Go Auth | **STACK FOUT.** Repo = Astro + Convex + Go Auth. Alleen Go Auth/Vercel/SEO klopt. |
| JeffDash | `QRCodeMaster` (NIET JeffriesHomeapp) | ✅ | Next.js/Convex/React19/**Go Auth** | Dynamic-QR + scan-analytics **echt**. Maar auth is **Clerk**, niet Go Auth. "Sub-50ms redirection" onverifieerbaar. |

**Geverifieerd-echte technische claims om te houden:** Dustin RDW BFF-proxy + xAI Grok Vision kenteken-OCR; JeffDash dynamic redirect + geo/AB/device scan-analytics; SmartCoolCare ESP32 deep-sleep BLE-firmware; DKL 27-tabel Convex event-platform.

**Verzonnen:** SmartCoolCare "24/7 Automatische SMS Alerts."

**Onverifieerbare marketing-nummers (nul onderbouwing in enige repo):** "100+ aanmeldingen", "+340% organisch verkeer", "€10K+ opgehaald", "0 mislukte transacties", "Sub-100ms ingest", "100% uptime", "Sub-50ms redirection", alle "avg Lighthouse"-scores.

**Echte projecten NIET op de site:** `JeffriesHomeapp` (interne LaventeCare CRM/ops), `LaventeCareAuthSystems` (de Go "Zero-Trust" backend die de Go-Auth-tags echt aandrijft), `3x3andersScraper` (zorg-sourcing, Apify+Gemini), `DKLPDFBuilder`, `HenkeWonen`/`HenkeWonenDATA`. Kandidaten om te tonen (esp. AuthSystems als het echte security-bewijs).

> Noot: de opdracht-hint "jeffdash → likely JeffriesHomeapp" is **onjuist** — JeffDash is `QRCodeMaster` (bewezen via `clerk.jeffdash.com`, `www.jeffdash.com`, "JeffDash QR"-branding).

---

## 7. Open beslissingen voor Jeffrey (minimale set vóór rebuild)

1. **Positionering.** Canoniek "B2B systeempartner / structurele partner" **of** het live "high-end architectuurpartner, één engineer + AI-bouwteam"? Deze spreken elkaar tegen; elke pagina hangt af van het antwoord. *(Advies: leid met canon's partner-framing; houd het eerlijke solo+AI-verhaal als transparantie-sectie op `/over`, niet als top-line merk.)*
2. **Doelgroep instap (fit).** Houd de site "budget vanaf €3.000"-instapgrens? Niet in `fit.ts` canon — bevestig of het een echte, bedoelde kwalificatie is.
3. **Tarief / SLA-nummers.** €95/u is bevestigd. Maar commit op echte SLA-responstijden (of houd expliciet inspanningsverplichting) zodat "1u/4u/99.99%" elkaar en canon niet langer tegenspreken.
4. **Merkkleur.** Eén canonieke primary tussen groen `#0D7C5F` / teal `#0891B2` / `#0C4A6E` / backend-oranje `#ff6b00`. *(Advies: groen `#0D7C5F` per `profile.ts`, lijn dan `Layout.astro` theme-color en de AuthSystems tenant-seed uit.)*
5. **NAH-zorg-verhaal.** Canon zegt LaventeCare is expliciet **geen** zorg-consultancy, maar `/over` zet de NAH-zorg-achtergrond voorop. Beslis: houden als (begrensde) persoonlijke geloofwaardigheids-backstory, of terugbrengen. Los tegelijk het "één engineer + AI-bouwteam"-narratief op.
6. **(Bonus, blokkeert legal/footer)** Welke rechtspersoon is publiek: LaventeCare eenmanszaak (KVK 88162710) of "Lavente Care V.O.F." (KvK 94908427)? De backend-mailtemplates beweren de V.O.F. — moet worden beslecht vóór enige footer/legal-copy vertrouwd wordt.

---

**Bottom line:** De canonieke data is een solide, grotendeels-consistente baseline (prijzen, proces, fit, SLA-vocab, legal-stack, security-principes verifiëren allemaal). De blocker is niet ontbrekende data — het is dat de **live site een ander, deels-onnauwkeurig verhaal vertelt** en defects shipt. Herbouw *vanuit canon*, beslis de zes bovenstaande punten, fix de reconciliatielijst (mojibake, tech-tags, Lighthouse, tegenstrijdigheden) en strip onverifieerbare claims → GREEN.

*Bronnen inline geciteerd; primaire canon = `JeffriesHomeapp\lib\laventecare\*`; live pagina's = `LaventeCareFrontend\src\pages\*`; portfolio-repos = `Desktop\Projecten\*`; intake-contract = `LaventeCareAuthSystems\internal\api\handlers\public_contact.go`.*
