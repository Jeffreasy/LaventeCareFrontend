# LaventeCare — Schrijfgids & Tone of Voice

> Voor iedereen (mens of AI) die tekst schrijft voor de LaventeCare-site, offertes, mails of PDF's.
> Doel: **elke bezoeker snapt binnen 3 seconden wat we doen en wat het oplevert** — zonder woordenboek.
> Opgesteld 2026-07-06, op basis van de leesbaarheidsaudit. Zie ook `LAVENTECARE_LEESBAARHEID_AUDIT.md`.

## 1. Wie lezen dit?

Nederlandse **mkb-eigenaren en operationeel managers**. Slim en zakelijk, maar **niet technisch**. Ze beslissen over budget, niet over architectuur. Schrijf voor hen — niet voor developers.

Doelniveau: **eenvoudig, direct Nederlands (B1–B2)**. Engelse pagina's: plain business English.

## 2. Het kernprincipe (onthoud alleen dit)

> **Gewone taal eerst, vakterm erachter.**
> Techniek hoort níet in koppen, knoppen of tag-pills. Zet de benefit in gewone taal vooraan; verplaats de vakterm naar tussen haakjes of naar de **"Onder de motorkap"-box** voor developers.

Fout → Goed:
- ❌ "Multi-tenant data-isolatie via PostgreSQL RLS, RBAC en audit trails"
- ✅ "De gegevens van uw klanten staan strikt gescheiden, iedereen ziet alleen wat hij mag, en elke actie wordt vastgelegd." *(Onder de motorkap: PostgreSQL RLS, RBAC, audit logging.)*

De **FAQ** (`FAQSection.astro`) is ons toonvoorbeeld — die legt zijn eigen jargon al uit ("Tenant Isolatie" → "een eigen afgesloten kluis"). Schrijf zoals de FAQ.

## 3. Zeven schrijfregels

1. **Eén idee per zin.** Max ~20 woorden. Twee ideeën? Twee zinnen.
2. **Actief, niet passief.** "Wij bouwen…" niet "Er wordt gebouwd…".
3. **Benefit eerst, techniek daarna.** Wat levert het de klant op? Dan pas hóe.
4. **Concreet, geen containerwoorden.** Vermijd "oplossingen", "ecosysteem", "robuust", "schaalbaar" (als het vaag is). Benoem wat het ís.
5. **U-vorm, consequent.** Spreek de lezer aan met "u". Houd dat overal vol.
6. **Techniek als bewijs, niet als taal.** Tech-namen (Astro, Convex, ESP32, PostgreSQL RLS) mogen als **badge of voetnoot** blijven staan — ze wekken vertrouwen — maar nooit in een volzin, kop of knop.
7. **Kies één woord en houd het vast.** Zie de vaste keuzes hieronder.

## 4. Vaste woordkeuzes (consistentie)

Gebruik overal hetzelfde woord — wisselende termen ondermijnen vertrouwen.

| Gebruik dit | Niet dit |
|---|---|
| **aanvragen** / **aanvraag** | leads, conversie, lead generation |
| **stilstand** | downtime |
| **Plan een gratis adviesgesprek** (CTA) | Plan een Discovery, Schedule a Discovery |
| **onderhoudscontract (SLA)** | SLA-managed, managed beheer |
| **vaste partner** | structurele/structurele partner |
| **bouwplan** / **Blueprint (het bouwplan)** | los "Blueprint" zonder uitleg |
| **vooronderzoek** / **Onderzoek & ontwerp (Discovery)** | los "Discovery" in knoppen/koppen |
| **live in gebruik** / **in de praktijk** | in productie |
| **een mens beslist mee** | human-in-the-loop, mens in the loop |
| **alles op één plek** | single source of truth, één bron van waarheid |
| **klanten werven** | lead generation (als menu-/kop-label) |
| **Beveiliging & Toegang** | Security & Auth |

## 5. Woordenlijst: moeilijk → simpel

De volledige tabel staat in `LAVENTECARE_LEESBAARHEID_AUDIT.md §2`. De belangrijkste:

| Moeilijk | Simpel |
|---|---|
| professioneel neerzetten | goed en betrouwbaar regelen |
| vertaalt naar werkende systemen | omzet in software die het werk uit handen neemt |
| vraagstuk | vraag / probleem |
| faciliteren | mogelijk maken / helpen |
| scope (als zelfstandig naamwoord) | de afspraak |
| robuust | stabiel / betrouwbaar |
| schaalbaar (vaag) | groeit met u mee |
| telemetrie / monitoring | live overzicht / bewaking |
| ingest / datastromen | gegevens binnenhalen |
| bottleneck | knelpunt |
| ROI | wat het u oplevert |
| end-to-end | van begin tot eind |

**Juridische termen** (voorwaarden/prijzen) — laten staan, maar 1× kort uitleggen:
- inspanningsverplichting → "we doen ons best; geen harde garantie tenzij in het contract"
- opschortingsrecht → "we mogen het werk tijdelijk stilleggen bij niet-betalen"
- ingebrekestelling → "schriftelijke herinnering/aanmaning"
- indexatie (CBS) → "prijs stijgt jaarlijks mee met de inflatie"

## 6. Vaktermen die mógen blijven

Deze zijn dragend of algemeen bekend — houden, mits **op de juiste plek** (badge/dev-box/haakjes) en bij eerste gebruik in gewone taal ingeleid:

- **PostgreSQL RLS, RBAC, Zero-Trust, CSP, Dual-Token** → alleen in de "Onder de motorkap"-box.
- **Blueprint, Discovery** → als merknaam/fase, altijd met NL-glos.
- **SLA** → 1× voluit + uitleg.
- **AVG, verwerkersovereenkomst** → verplicht/verwacht, mogen blijven.
- **SEO, AI, automatisering, dashboard, cloud, hosting** → algemeen bekend.
- **Tech-stack badges** (Astro, Convex, Go, ESP32, BLE) → als vertrouwenssignaal in badge-rijen.

## 7. Checklist voor nieuwe copy

Vóór publicatie, loop dit langs:

- [ ] Snapt een niet-technische mkb'er de **kop** en de **knop** zonder uitleg?
- [ ] Staat de **benefit vooraan**, de techniek erachter?
- [ ] Elke zin **één idee**, onder ~20 woorden?
- [ ] Geen **containerwoorden** (oplossingen/ecosysteem/robuust) zonder invulling?
- [ ] **Consistente** termen (aanvragen, stilstand, gratis adviesgesprek)?
- [ ] Vaktermen alleen in **badge/dev-box/haakjes**, met uitleg bij eerste gebruik?
- [ ] NL en EN in **parity**?
- [ ] Geen spelfouten (lees hardop)?

## 8. Over het leesbaarheidscijfer (Flesch-Douma)

Er is een meetscript: `scratchpad/readability-score.mjs` (draait tegen de dev-server, meet alleen `<p>`/`<li>`-prozateksten per pagina).

**Gebruik het als relatieve radar, niet als doel.** Nederlands scoort structureel 15–20 punten lager dan Engels door samengestelde woorden (adviesgesprek, onderhoudscontract) — die zijn legitiem en blijven. Een score van ~35–50 is normaal voor goed zakelijk Nederlands. Jaag het getal **niet** na met hakkelige mini-zinnen. Gebruik het alleen om **uitschieters** te vinden (pagina's met veel langere zinnen dan de rest) en die op te knippen.

Richtlijn: springt een pagina >10 punten onder het gemiddelde? Kijk of daar te lánge zinnen staan. Zo niet, dan is het woordlengte — laat het met rust.
