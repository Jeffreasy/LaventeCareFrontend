"""Generate the Dutch LaventeCare terms PDF from the current commercial scope."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "LCVoorwaarden2026juli.pdf"

SECTIONS = [
    (
        "1. Identiteit en definities",
        [
            "LaventeCare is de eenmanszaak van Jeffrey Lavente, gevestigd in Dronten, KVK 88162710, BTW NL004553268B57.",
            "Opdrachtgever is de natuurlijke persoon of rechtspersoon die beroeps- of bedrijfsmatig een opdracht geeft. Website is een publiek toegankelijke website. Website Care is de optionele beheerdienst voor websites. Systeem-SLA is een afzonderlijke onderhoudsovereenkomst voor applicaties, databases, dashboards of bedrijfskritieke koppelingen.",
        ],
    ),
    (
        "2. Toepasselijkheid en rangorde",
        [
            "Deze voorwaarden gelden voor iedere offerte, opdracht en vervolgopdracht. Inkoopvoorwaarden van opdrachtgever worden afgewezen, tenzij LaventeCare deze schriftelijk aanvaardt.",
            "De rangorde is: getekende verwerkersovereenkomst, getekende offerte of opdrachtomschrijving, projectspecifieke serviceovereenkomst, deze voorwaarden.",
        ],
    ),
    (
        "3. Offerte, scope en medewerking",
        [
            "Een offerte is geldig gedurende de daarin genoemde termijn. Prijzen zijn exclusief btw, tenzij uitdrukkelijk anders vermeld.",
            "De afgesproken scope bepaalt wat inbegrepen is. Opdrachtgever levert juiste, definitieve inhoud, toegangen en feedback tijdig aan. Vertraging of extra werk door ontbrekende of gewijzigde input kan na voorafgaand overleg gevolgen hebben voor planning en prijs.",
        ],
    ),
    (
        "4. Vaste websitepakketten",
        [
            "<b>Website Start: €750 eenmalig. Website Business: €1.000 eenmalig. Website Maatwerk: vanaf €1.500 eenmalig.</b> Dit zijn scherpe startprijzen voor de expliciet genoemde scope; uitbreidingen worden vooraf geoffreerd.",
            "Domeinregistratie, zakelijke mailboxen, betaalde licenties, advertentiebudget en externe abonnementen zijn niet inbegrepen, tenzij de offerte dit vermeldt. Correctierondes en paginalimieten volgen het gekozen pakket.",
        ],
    ),
    (
        "5. Maatwerk en acceptatie",
        [
            "Maatwerk wordt opgeleverd in afgesproken mijlpalen. Opdrachtgever test een oplevering binnen de in de offerte genoemde beoordelingstermijn en meldt reproduceerbare materiële gebreken. Kleine punten die normaal gebruik niet verhinderen, stellen acceptatie niet uit.",
            "Werk buiten de afgesproken scope, gewijzigde wensen en aanpassingen door derden zijn meerwerk en vereisen vooraf overeenstemming over de gevolgen.",
        ],
    ),
    (
        "6. Prijzen, facturatie en betaling",
        [
            "Het betaalschema staat in de offerte. Facturen hebben een betaaltermijn van 30 dagen, tenzij anders afgesproken. Website Care wordt maandelijks vooraf gefactureerd; automatische betaling geldt alleen wanneer dit expliciet is overeengekomen.",
            "LaventeCare mag terugkerende tarieven eenmaal per jaar aanpassen volgens de Nederlandse consumentenprijsindex en kondigt dit ten minste 30 dagen vooraf aan. Na een betalingsherinnering mag LaventeCare werk of dienstverlening evenredig opschorten.",
        ],
    ),
    (
        "7. Intellectueel eigendom en overdracht",
        [
            "Na volledige betaling kunnen projectspecifieke websitecode en afgesproken resultaten worden overgedragen naar een account op naam van opdrachtgever. Generieke modules, werkwijzen, tooling en bestaande componenten blijven eigendom van LaventeCare; opdrachtgever ontvangt het gebruiksrecht dat nodig is voor het opgeleverde resultaat.",
            "Software van derden blijft onder de eigen licentie vallen. Klantdata blijft eigendom van opdrachtgever. Ruimere broncode- of exclusiviteitsrechten voor maatwerkplatformen gelden alleen als die uitdrukkelijk zijn afgesproken.",
        ],
    ),
    (
        "8. Website Care en systeemonderhoud",
        [
            "<b>Website Care is optioneel: €29/maand voor Start, €49/maand voor Business en vanaf €75/maand voor Maatwerk.</b> Opzeggen kan met één volledige kalendermaand. Normaal gebruik, fair-usegrenzen en externe kosten staan op laventecare.nl/website-care.",
            "Website Care omvat geautomatiseerde bewaking en een handmatige reactiedoelstelling op werkdagen; dit is geen gegarandeerde 24/7-reactie-SLA. Applicaties met accounts, databases of bedrijfskritieke koppelingen vragen een apart overeengekomen Systeem-SLA.",
        ],
    ),
    (
        "9. Persoonsgegevens en beveiliging",
        [
            "Beide partijen houden zich aan toepasselijke privacywetgeving. Wanneer LaventeCare persoonsgegevens namens opdrachtgever verwerkt, sluiten partijen waar nodig een verwerkersovereenkomst.",
            "LaventeCare past passende technische en organisatorische beveiliging toe, maar kan absolute veiligheid niet garanderen. De privacyverklaring op laventecare.nl/privacy beschrijft de verwerking via de website en aanvragen.",
        ],
    ),
    (
        "10. Geheimhouding",
        [
            "Beide partijen houden vertrouwelijke informatie geheim en gebruiken die alleen voor de opdracht. Dit geldt niet voor informatie die zonder schending al openbaar is, zelfstandig is verkregen of op grond van een wettelijke plicht moet worden verstrekt.",
        ],
    ),
    (
        "11. Beschikbaarheid, derden en overmacht",
        [
            "Uitvoering en beschikbaarheid kunnen afhangen van hosting, e-mail, API’s, registrars en andere leveranciers. LaventeCare is niet aansprakelijk voor storingen buiten haar redelijke invloed, maar neemt binnen de afgesproken dienst redelijke maatregelen om gevolgen te beperken.",
            "Bij overmacht worden getroffen verplichtingen opgeschort. Duurt de situatie langer dan 60 dagen, dan mag iedere partij het getroffen deel beëindigen zonder vergoeding voor toekomstig werk.",
        ],
    ),
    (
        "12. Aansprakelijkheid",
        [
            "LaventeCare is alleen aansprakelijk voor directe schade door een toerekenbare tekortkoming nadat een redelijke herstelkans is geboden. De aansprakelijkheid is beperkt tot het bedrag dat in de voorafgaande zes maanden voor de getroffen opdracht is betaald, met als maximum het door de verzekering uitgekeerde bedrag.",
            "Gederfde winst, gemiste besparingen, bedrijfsstilstand, gegevensverlies en andere indirecte schade zijn uitgesloten, behalve wanneer dwingend recht dit verbiedt of bij opzet of bewuste roekeloosheid.",
        ],
    ),
    (
        "13. Duur en beëindiging",
        [
            "Projectopdrachten eindigen na oplevering en betaling. Doorlopende diensten kunnen worden opgezegd volgens de offerte of servicepagina. Verricht werk, aangegane externe kosten en een redelijke overdracht blijven verschuldigd.",
            "Iedere partij mag beëindigen bij een wezenlijke tekortkoming die niet binnen een redelijke schriftelijke hersteltermijn wordt opgelost. Directe beëindiging blijft mogelijk wanneer voortzetting redelijkerwijs niet kan worden verlangd.",
        ],
    ),
    (
        "14. Wijzigingen, recht en geschillen",
        [
            "LaventeCare mag deze voorwaarden voor toekomstige opdrachten en doorlopende diensten wijzigen en kondigt een materiële wijziging ten minste 30 dagen vooraf aan. Voor een lopend vast project blijft de bij aanvang afgesproken versie gelden, tenzij partijen anders overeenkomen.",
            "Nederlands recht is van toepassing. Partijen proberen een geschil eerst in goed overleg op te lossen. Lukt dat niet, dan is de bevoegde rechter in het arrondissement waar LaventeCare is gevestigd bevoegd, tenzij dwingend recht anders bepaalt.",
        ],
    ),
]


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#D9E5E8"))
    canvas.line(22 * mm, 17 * mm, width - 22 * mm, 17 * mm)
    canvas.setFillColor(colors.HexColor("#476068"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(22 * mm, 11 * mm, "LaventeCare · Algemene Voorwaarden · 24 juli 2026")
    canvas.drawRightString(width - 22 * mm, 11 * mm, f"Pagina {doc.page}")
    canvas.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.4,
        leading=14.4,
        textColor=colors.HexColor("#24383F"),
        spaceAfter=5 * mm,
    )
    heading = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#057A68"),
        spaceAfter=3 * mm,
    )
    title = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=colors.HexColor("#082E39"),
        alignment=TA_CENTER,
        spaceAfter=5 * mm,
    )
    meta = ParagraphStyle(
        "Meta",
        parent=body,
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#476068"),
        spaceAfter=7 * mm,
    )
    box = ParagraphStyle(
        "Box",
        parent=body,
        borderColor=colors.HexColor("#A5D6CD"),
        borderWidth=0.6,
        borderPadding=9,
        backColor=colors.HexColor("#EFF9F6"),
        spaceAfter=8 * mm,
    )

    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=22 * mm,
        bottomMargin=23 * mm,
        title="Algemene Voorwaarden LaventeCare",
        author="LaventeCare — Jeffrey Lavente",
        subject="Versie 24 juli 2026",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=draw_page))

    story = [
        Spacer(1, 5 * mm),
        Paragraph("Algemene Voorwaarden", title),
        Paragraph(
            "LaventeCare · Jeffrey Lavente · KVK 88162710 · BTW NL004553268B57<br/>"
            "Versie 24 juli 2026 · juridisch leidende Nederlandstalige versie",
            meta,
        ),
        Paragraph(
            "Deze voorwaarden gelden voor offertes en opdrachten van LaventeCare. In een offerte "
            "kunnen aanvullende of afwijkende projectafspraken staan; bij strijdigheid gaat de "
            "ondertekende offerte voor.",
            box,
        ),
    ]
    for section_title, paragraphs in SECTIONS:
        content = [Paragraph(section_title, heading)]
        content.extend(Paragraph(paragraph, body) for paragraph in paragraphs)
        story.append(KeepTogether(content))
        story.append(Spacer(1, 2 * mm))

    story.extend(
        [
            Spacer(1, 4 * mm),
            Paragraph(
                "<b>Contact</b><br/>jeffrey@laventecare.nl · +31 6 39 03 40 85 · Dronten<br/>"
                "laventecare.nl/voorwaarden · laventecare.nl/privacy · laventecare.nl/website-care",
                box,
            ),
        ]
    )
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
