# LaventeCare — Woordkeuze & Leesbaarheid Audit

> Doelgroep: Nederlandse mkb-eigenaren en operationeel managers — slim, maar **niet technisch**. Doelniveau: eenvoudig, direct Nederlands (B1–B2). Opgesteld 2026-07-06 o.b.v. de herbouwde site.

## 1. Oordeel

**Huidig niveau: B2, met stevige C1-uitschieters. Doel: B1–B2.** De site is structureel sterk geschreven — korte, actieve zinnen, benefit-first opzet, en veel echt heldere passages (het zorgverhaal, "van idee tot werkend systeem", de FAQ). Maar op de plekken die er het meest toe doen (hero, USP-koppen, pijler-kaarten, CTA-knoppen, meta-titels, prijs/SLA-blokken) stapelt de copy jargon en stijf Nederlands. Voor een niet-technische mkb-eigenaar zakt het begrip precies daar weg waar een aankoopbeslissing valt.

De vier grootste, terugkerende patronen:

1. **Onvertaald Engels tech-/consultancyjargon in headlines en CTA's.** "Plan een Discovery" (de belangrijkste conversieknop, 4x), "Blueprint", "Single source of truth", "human-in-the-loop", "Multi-tenant data-isolatie (PostgreSQL RLS)", "RBAC", "audit trails", "Zero-Trust", "Change Requests". Dit is het grootste probleem: het staat vaak in koppen en knoppen, waar de lezer geen context heeft om het te ontcijferen.

2. **Jargon-clusters op de verkeerde plek.** De security-pagina's stapelen 4-5 vaktermen in één zin, in de hero en op tag-pills — terwijl de gewone-taal uitleg er vaak al ónder staat. Het patroon "Onder de motorkap / Voor ontwikkelaars" is precies goed; het probleem is dat het jargon dat kader uit lekt naar de hero en de koppen.

3. **Formeel/ambtelijk Nederlands en abstracte containerbegrippen.** "professioneel neerzetten", "structurele partner die bedrijfsprocessen vertaalt naar werkende systemen", "vraagstuk", "faciliteren", "conform", "ingebrekestelling", "inspanningsverplichting" — plus lege buzzwords als "robuust", "schaalbaar", "ecosysteem", "oplossingen", "presteren".

4. **Inconsistentie ondermijnt vertrouwen.** Dezelfde actie heet "Discovery" (hero) én "intake" (onderaan); "leads" naast "aanvragen"; "downtime" naast "stilstand"; onvertaalde NL-resten op EN-pagina's ("AV Article 9", "CBS"); en enkele echte spelfouten ("meetaparatuur", "beschikibare", "bewaakt").

Beste pagina's (dicht op doel, B1–B2): `consultancy.astro`, `FAQSection.astro`, `lead-generation`, `iot-hardware`, `404.astro`, `voorwaarden.astro`. Zwakste (C1 — te moeilijk): `security.astro` (NL+EN), `dustin-auto-garage.astro`, `smartcoolcare.astro`, en de SLA/juridische blokken van `prijzen.astro` en `werkwijze.astro`.

---

## 2. Meestvoorkomende probleemwoorden — Master Glossary

Gerangschikt op hoe vaak het woord/de zin terugkeert over pagina's heen. Dit is de kern-deliverable: één vertaaltabel voor de hele site.

| # | Moeilijk woord/zin | Eenvoudig alternatief | Advies |
|---|---|---|---|
| 1 | **Single source of truth / één bron van waarheid** | "alle gegevens op één plek, altijd actueel" / tag "Alles op één plek" | Vervangen (of 1x uitleggen) |
| 2 | **Discovery / Plan een Discovery** | "kennismaking" / "vooronderzoek" / "Plan een gratis adviesgesprek" | In knoppen/koppen vervangen; als productnaam: uitleggen |
| 3 | **Blueprint** | "ontwerp" / "bouwplan" / "blauwdruk (het volledige plan)" | Mag blijven als merknaam, maar altijd 1x uitleggen |
| 4 | **Multi-tenant data-isolatie (PostgreSQL RLS)** | "gegevens van elke klant strikt gescheiden" | Uitleggen; termen naar de "Onder de motorkap"-box |
| 5 | **RBAC / rolgebaseerde toegangscontrole** | "iedereen ziet alleen wat hij mag zien" / "toegang per rol" | Vervangen op pills; acroniem alleen in dev-box |
| 6 | **audit trails / audit logs** | "elke actie wordt vastgelegd" / "alles is traceerbaar" | Vervangen in klanttekst; term evt. in schema |
| 7 | **human-in-the-loop / mens in the loop** | "een mens beslist mee op de belangrijke momenten" | Vervangen overal |
| 8 | **security-first / Zero-Trust** | "veiligheid vanaf de basis" / "we vertrouwen niets zonder controle" | Vervangen of uitleggen |
| 9 | **conversie / converteren / conversiegericht** | "een aanvraag/klant worden" / "meer aanvragen" | Vervangen |
| 10 | **SLA / SLA-managed / Managed beheer** | "onderhoudscontract met vaste afspraken" | Uitleggen (SLA 1x voluit) |
| 11 | **structurele/structureel partner** | "vaste partner" / "vaste, langdurige partner" | Vervangen |
| 12 | **vertaalt naar (werkende systemen)** | "omzet in" / "maakt tot" | Vervangen |
| 13 | **professioneel neerzetten** | "goed en betrouwbaar geregeld" / "goed aanpakken" | Vervangen |
| 14 | **scope / buiten scope / scope creep** | "de afspraak" / "buiten de afspraak" / "het project dijt ongemerkt uit" | Vervangen |
| 15 | **Change Request(s)** | "wijzigingsverzoek" (1x met Engels erbij) | Uitleggen |
| 16 | **schaalbaar / schaalbare architectuur** | "groeit met u mee" / "dat meegroeit" | Vervangen (want vaag hier) |
| 17 | **robuust** | "sterk" / "stabiel" / "betrouwbaar" | Vervangen |
| 18 | **oplossingen / ecosysteem / spectrum** | concreet benoemen (bv. "systemen", "vakgebied") | Vervangen |
| 19 | **afterthought / niet als afterthought** | "niet als bijzaak achteraf" | Vervangen |
| 20 | **in productie / Bewezen in productie** | "in de praktijk" / "live in gebruik" | Vervangen |
| 21 | **telemetrie / monitoring** | "live overzicht" / "bewaking" | Vervangen |
| 22 | **Islands / hydration / JavaScript payload / Lighthouse** | "laadt snel, ook op mobiel" | Vervangen (drop de metric) |
| 23 | **deep-sleep / BLE / OTA / ESP32 / firmware** | "zuinige slaapstand" / "draadloos" / "updates op afstand" | Vervangen in koppen/tegels; alleen in tech-voetnoot |
| 24 | **ingest / data-stromen / datastromen** | "binnenhalen van gegevens" / "hoe gegevens door uw systeem stromen" | Vervangen |
| 25 | **inspanningsverplichting** | "we doen ons uiterste best, maar geen harde garantie tenzij in contract" | Uitleggen |
| 26 | **opschortingsrecht** | "we mogen het werk tijdelijk stilleggen bij niet-betalen" | Uitleggen |
| 27 | **ingebrekestelling** | "schriftelijke herinnering/aanmaning" | Vervangen/uitleggen |
| 28 | **indexatie / geïndexeerd (CBS) / CPI** | "prijs stijgt jaarlijks mee met de inflatie (CBS-cijfers)" | Uitleggen |
| 29 | **iteratief / sprints / kwartaalsprints** | "stap voor stap" / "in vaste blokken per kwartaal" | Vervangen |
| 30 | **lead / leads / Lead-management / Lead Generation** | "aanvraag" / "aanvragen opvolgen" / "klanten werven" | Vervangen (consistent "aanvragen") |
| 31 | **bottleneck** | "knelpunt" | Vervangen |
| 32 | **ROI** | "rendabel" / "wat het u oplevert" | Vervangen/uitleggen |
| 33 | **vraagstuk** | "vraag" / "probleem" | Vervangen |
| 34 | **sparring partner / spar / sober advice (EN)** | "meedenker" / "klankbord" / "eerlijk, nuchter advies" | Vervangen |
| 35 | **happy paths** | "de makkelijkste route, uitzonderingen overgeslagen" | Vervangen |
| 36 | **matchmaking / data-driven** | "koppelen" / "slim koppelen op basis van..." | Vervangen |
| 37 | **end-to-end / high-performance / multi-step** | "van begin tot eind" / "supersnel" / "in stappen" | Vervangen |
| 38 | **IDOR-attacks / race conditions / dependencies** | "voorkomen dat iemand data ziet waar hij geen recht op heeft" / "ook bij grote drukte" / "onderdelen van buitenaf" | Vervangen/uitleggen |
| 39 | **systeempartner / systems partner** | "wij bouwen software en systemen" | Vervangen |
| 40 | **NAH / P1-incidenten / degradatie / workaround** | "hersenletsel" / "volledige uitval" / "app werkt slecht" / "tijdelijke oplossing" | Uitleggen/vervangen |

---

## 3. Hotspots per pagina

De findings met hoogste severity, gegroepeerd per pagina. Huidige tekst → eenvoudiger alternatief.

### `src/pages/index.astro` (NL home) — B2, C1-uitschieters
- **"Plan een Discovery"** (hero-CTA, 4x) → **"Plan een gratis adviesgesprek"** *(hoogste prioriteit — dit is de primaire conversieknop)*
- **"professioneel willen neerzetten"** (hero) → **"serieus willen aanpakken / goed willen regelen"**
- **"structurele partner die bedrijfsprocessen vertaalt naar werkende systemen"** (hero) → **"vaste partner die uw manier van werken omzet in software die het werk uit handen neemt"**
- **"Multi-tenant data-isolatie via PostgreSQL RLS, RBAC en audit trails"** (pijler + USP-2) → benefit eerst: **"Uw gegevens zijn per klant strikt gescheiden en beschermd. Onder de motorkap: PostgreSQL RLS, toegang per rol (RBAC) en volledige logging."**
- **"één single source of truth voor al uw datastromen"** → **"één centrale plek waar al uw gegevens kloppen en actueel zijn"**
- **"human-in-the-loop"** → **"met een mens die meekijkt en beslist"**
- **"SLA — Managed beheer mogelijk"** (stat) → **"Doorlopend onderhoud mogelijk"**

### `src/pages/en-index.astro` (EN home) — B2, C1 spikes
- **"Schedule a Discovery"** (hero) vs **"Schedule an intake"** (onderaan) → unificeer naar **"Book a free intro call"**
- **"a structural partner that translates business processes into working systems"** → **"a long-term partner that turns the way you work into software that does the work for you"**
- **"establish digital growth ... professionally"** → **"get digital growth, automation and custom software done right"**

### `src/pages/diensten/security.astro` — C1, te moeilijk (zwakste NL-pagina)
- **Hero: "Elk platform wordt security-first gebouwd, met multi-tenant data-isolatie (PostgreSQL Row Level Security), RBAC en audit trails"** → **"Beveiliging zit vanaf de eerste regel code ingebouwd. De gegevens van uw klanten staan technisch gescheiden, iedereen ziet alleen wat hij mag, en elke actie wordt vastgelegd."**
- **Tag-pills "PostgreSQL RLS / RBAC / Multi-tenant"** → **"Gescheiden klantdata / Toegang per rol / Alles traceerbaar"**
- **Principe-koppen (Engels): "Input is Toxic / Silence is Golden / The Database is a Fortress / Race Conditions are Fatal / Dependency Paranoia"** → NL-koppen: **"Alles wat binnenkomt is verdacht / Aanvallers leren niets uit foutmeldingen / De database bewaakt zichzelf / Betrouwbaar, ook bij grote drukte / Alleen bewezen, gecontroleerde onderdelen"**
- **"Onwijzigbare audit logs voor forensische integriteit"** → **"Elke actie wordt vastgelegd in een logboek dat niet achteraf aangepast kan worden"**

### `src/pages/diensten/ai-prompt-engineering.astro` — B2
- **"met een mens in the loop op de kritieke momenten"** (hero + intro + meta) → **"waarbij een mens meebeslist op de belangrijke momenten"**
- **"Van prompt tot productie"** (kop) → **"Van idee tot werkend systeem"**

### `src/pages/diensten/maatwerk-platformen.astro` — B2
- **"Platformen die presteren"** (H1) → **"Alles op één plek, automatisch geregeld"**
- **Tag "Single source of truth"** → **"Eén centraal systeem"**
- **Card-titel "Eén bron van waarheid"** → **"Alles op één plek"**

### `src/pages/diensten/iot-hardware.astro` — B2
- **Hero-tegels "deep-sleep / BLE / OTA / Firmware"** → **"Zuinig, werkt maandenlang / Draadloos / Updates op afstand"**
- **"ESP32 leest data, gaat terug in deep-sleep"** → **"De sensor meet de waarde en gaat daarna in slaapstand om stroom te sparen."**

### `src/pages/prijzen.astro` — B2–C1 (juridische blokken)
- **"Discovery & Blueprint" + "Start discovery"** → **"Onderzoek & Blueprint (technisch bouwplan)" + "Start het vooronderzoek"**
- **"opschortingsrecht van toepassing bij niet-betaling"** → **"bij niet-betalen mogen we het werk tijdelijk stilleggen (opschortingsrecht)"**
- **"...gelden als inspanningsverplichting, tenzij het contract expliciet een harde SLA noemt"** → **"we doen ons uiterste best om deze tijden te halen, maar het zijn richtlijnen — geen harde garantie, tenzij dat in het contract staat"**

### `src/pages/werkwijze.astro` — B2–C1
- **"U ontvangt een Blueprint-document (Single Source of Truth)"** → **"U krijgt één centraal document met alle afspraken en het ontwerp"**
- **"...opschorting van diensten na schriftelijke ingebrekestelling"** → **"betaalt u niet op tijd, dan sturen we eerst een herinnering; blijft betaling uit, dan mogen we het werk tijdelijk stilleggen"**

### `src/pages/portfolio/dustin-auto-garage.astro` — C1 (meest jargon-dicht)
- **"Split-Role Security Model"** (kop) → **"Iedereen ziet alleen wat hij mag zien"**
- **"Het systeem moet IDOR-attacks voorkomen op elk niveau"** → **"Het systeem moet voorkomen dat iemand gegevens ziet waar hij geen recht op heeft"**
- **"Vier rollen ... met hiërarchische RBAC. Elke API-call wordt server-side gevalideerd ... Cross-tenant isolatie"** → **"Elke medewerker heeft eigen rechten... Het systeem controleert bij elke actie of iemand het mag. Garages kunnen nooit bij elkaars gegevens."**

### `src/pages/portfolio/de-koninklijke-loop.astro` — B2–C1
- **"Dual Backend Pattern"** (kop) → **"Snelle schermen, veilige betalingen"**
- **"Alleen de registratieformulieren ... worden als React Islands hydriert ... Lighthouse-scores ... JavaScript payload"** → **"Alleen de formulieren en het beheerscherm zijn interactief; de rest is kant-en-klaar. Daardoor laadt de pagina snel, ook op mobiel."**

### `src/pages/portfolio.astro` / andere case-koppen
- **"Dynamisch QR ecosysteem"** (jeffdash) → **"Eén systeem voor je QR-codes"**
- **"Data-driven matchmaking"** (tuinhub) → **"De juiste klant bij de juiste hovenier"**
- **"Conversie door technologie"** (cf-bouw) → **"Van bezoeker naar aanvraag"**

### Shared UI (`config.ts`, `Footer.astro`, `contact.astro`)
- **Meta-titel "B2B systeempartner voor mkb"** → **"Software en systemen voor het mkb — van idee tot werkend systeem"** *(browser-tab + Google-kop, zeer hoge zichtbaarheid)*
- **Nav-labels "Lead Generation" / "Security & Auth"** → **"Klanten werven" / "Beveiliging & Toegang"**
- **Contact-hero: "Ik bespreek met u de scope, technische haalbaarheid en budgetindicatie"** → **"Ik bespreek met u wat u wilt bouwen, of het technisch kan, en wat het ongeveer kost"**
- **"Go/No-Go"** (stat) → **"Ja of nee"** / **"Eerlijk advies"**
- **Footer-kolom "Resources"** → **"Meer"** of **"Volg ons"**

---

## 4. Legitieme vaktermen

Deze termen zijn ofwel breed bekend bij mkb'ers, ofwel echt dragend (LaventeCare ís een systeempartner). Ze mogen blijven — mits op de juiste plek en op eerste gebruik in gewone taal ingeleid.

| Term | Waarom mag blijven | Hoe simpel introduceren |
|---|---|---|
| **PostgreSQL RLS, RBAC, Zero-Trust, Dual-Token, rate limiting, CSP** | Geloofwaardigheidssignaal voor technische beoordelaars | Uitsluitend in de box **"Onder de motorkap — voor ontwikkelaars"**. Nooit in hero, koppen of pills. |
| **Blueprint** | Echt een genoemd deliverable in het aanbod | Merknaam behouden, altijd 1x glossen: "een Blueprint-document (het volledige bouwplan)" |
| **Discovery** | Echt een geproductiseerde fase | Behouden als merknaam + NL-glos: "Onderzoek & ontwerp (Discovery)" — consistent op alle pagina's |
| **SLA** | Standaard in onderhoudscontracten; juridisch dragend | 1x voluit + uitleg: "een onderhoudsabonnement met vaste afspraken (SLA)" |
| **AVG, verwerkersovereenkomst, CBS/CPI** | Juridisch verplicht en verwacht | Behouden; "indexatie" en "geïndexeerd" wél toelichten als "prijs stijgt mee met de inflatie" |
| **SEO** | Breed bekend in mkb-marketing | Behouden; de site legt het al goed uit als "gevonden worden in Google" — houd dat patroon aan |
| **AI, Automatisering, dashboard, cloud, hosting, workflows** | Inmiddels algemeen begrepen | Mogen blijven zoals ze zijn |
| **Tech-stack badges (Astro, Convex, Go, ESP32, BLE)** | Werken als vertrouwenssignaal in badge-rijen | Behouden, maar uitsluitend als badge/voetnoot — niet in volzinnen of koppen laten lekken |
| **Multi-tenant / data-isolatie** | Dragend voor security-verhaal | Term evt. tussen haakjes; benefit ("gegevens van elke klant strikt gescheiden") altijd eerst |

**Kernpatroon:** de "Onder de motorkap"-box is precies de juiste oplossing. De hele fix is: benefit-in-gewone-taal eerst, vakterm daarna (tussen haakjes of in de dev-box) — nooit andersom, en nooit in koppen/knoppen/pills.

---

## 5. Quick wins

De ~10 losse swaps met de hoogste impact op snelheid van begrip (grotendeels hero/nav/CTA/koppen):

1. **"Plan een Discovery"** → **"Plan een gratis adviesgesprek"** (primaire CTA, 4x — grootste conversiewinst)
2. **Meta-titel "B2B systeempartner voor mkb"** → **"Software en systemen voor het mkb — van idee tot werkend systeem"** (browser-tab + Google, elke pagina)
3. **Nav "Lead Generation" / "Security & Auth"** → **"Klanten werven" / "Beveiliging & Toegang"** (elke pagina zichtbaar)
4. **"Single source of truth" / "Eén bron van waarheid"** (koppen + pills) → **"Alles op één plek"** (terugkerend over 4+ pagina's)
5. **"human-in-the-loop" / "mens in the loop"** → **"een mens beslist mee"** (AI-pagina's + home)
6. **"professioneel neerzetten"** → **"goed en betrouwbaar geregeld"** (hero home + over + diensten)
7. **"...vertaalt naar werkende systemen"** → **"...omzet in software die het werk uit handen neemt"** (hero, site-breed herhaald)
8. **Contact-hero "scope, technische haalbaarheid en budgetindicatie"** → **"wat u wilt bouwen, of het technisch kan, en wat het ongeveer kost"** (hoog-intentie pagina)
9. **Vijf Engelse principe-koppen op security** → NL-koppen (bv. "Betrouwbaar, ook bij grote drukte")
10. **Spelfouten fixen:** "meetaparatuur" → "meetapparatuur", "beschikibare" → "beschikbare", "bewaakt" → "bewaak" (FAQ — vertrouwen)

Bonus (bijna gratis): **"Go/No-Go"** → **"Ja of nee"**; **"downtime"** → **"stilstand"** (consistent); **"leads"** → **"aanvragen"** (consistent).

---

## 6. Aanbeveling

**Ja — voer een gerichte plain-language herschrijfronde uit, maar niet de hele site tegelijk.** De basiskwaliteit is goed; het probleem is geconcentreerd. Aanpak in drie golven, van hoogste naar laagste rendement:

**Golf 1 — Hoog-zichtbare micro-copy (halve dag werk, grootste effect).**
Meta-titels, nav-labels, footer-brandline, alle hero-koppen en -sublines, en álle CTA-knoppen (met name "Discovery" → "adviesgesprek"). Dit raakt elke pagina en elke bezoeker, en verlaagt het gemiddelde niveau meteen naar B1–B2. Los hier ook de spelfouten en de EN-NL-inconsistenties op ("AV Article 9", "CBS", "Discovery" vs "intake").

**Golf 2 — De vier C1-pagina's herstructureren (1–2 dagen).**
`security.astro` (NL+EN), `dustin-auto-garage.astro`, `smartcoolcare.astro`, en de SLA/juridische blokken van `prijzen.astro` + `werkwijze.astro`. Regel: op elke jargon-zware sectie de gewone-taal benefit-zin vooraan zetten en de vaktermen naar de "Onder de motorkap"-box of tussen haakjes verplaatsen. De gewone-taal uitleg bestaat vaak al — hij moet alleen leiden in plaats van volgen. Voor de juridische termen ("inspanningsverplichting", "opschortingsrecht", "ingebrekestelling", "indexatie") volstaat een korte glos; verwijderen hoeft niet.

**Golf 3 — Consistentie-pas over de rest (halve dag).**
Kies één woord en houd het vast: "aanvragen" (niet "leads"), "stilstand" (niet "downtime"), "Blauwdruk/Blueprint" met vaste glos, "onderhoudscontract (SLA)". Portfolio-koppen en case-body's plain maken (benefit i.p.v. bouwtechniek).

**Scope-grens:** de FAQ (`FAQSection.astro`) is het beste geschreven en moet het **toonvoorbeeld** worden voor de herschrijving — het legt zijn eigen jargon al bewust uit ("Tenant Isolatie" → "eigen afgesloten kluis"). Laat de tech-stack badges, de "Onder de motorkap"-boxen, en de legitieme vaktermen uit sectie 4 met rust. Het doel is niet "alle techniek weg", maar: **techniek uit de koppen en knoppen, gewone taal eerst, vakterm erachter.**
