from __future__ import annotations

from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
LOGO_PATH = ROOT / "public" / "vinea-logo.png"

PURPLE = colors.HexColor("#5B21B6")
PURPLE_DARK = colors.HexColor("#2E1065")
PURPLE_MUTED = colors.HexColor("#F1EDFF")
GOLD = colors.HexColor("#C99A2E")
INK = colors.HexColor("#111827")
TEXT = colors.HexColor("#374151")
MUTED = colors.HexColor("#6B7280")
BORDER = colors.HexColor("#E5E7EB")
SOFT_BG = colors.HexColor("#F8FAFC")
WHITE = colors.white


def register_fonts() -> dict[str, str]:
    font_dir = Path("C:/Windows/Fonts")
    candidates = {
        "Segoe": "segoeui.ttf",
        "Segoe-Bold": "segoeuib.ttf",
        "Georgia": "georgia.ttf",
        "Georgia-Bold": "georgiab.ttf",
    }
    registered: dict[str, str] = {}
    for name, filename in candidates.items():
        path = font_dir / filename
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
            registered[name] = name

    return {
        "body": registered.get("Segoe", "Helvetica"),
        "bold": registered.get("Segoe-Bold", "Helvetica-Bold"),
        "serif": registered.get("Georgia", "Times-Roman"),
        "serif_bold": registered.get("Georgia-Bold", "Times-Bold"),
    }


FONTS = register_fonts()


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "kicker",
            parent=base["BodyText"],
            fontName=FONTS["bold"],
            fontSize=8.5,
            leading=10,
            textColor=PURPLE_DARK,
            alignment=TA_CENTER,
            spaceAfter=7,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=FONTS["serif_bold"],
            fontSize=25,
            leading=30,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["BodyText"],
            fontName=FONTS["body"],
            fontSize=10.4,
            leading=15,
            textColor=TEXT,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONTS["bold"],
            fontSize=13,
            leading=16,
            textColor=PURPLE_DARK,
            spaceBefore=10,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName=FONTS["bold"],
            fontSize=10.2,
            leading=13,
            textColor=INK,
            spaceBefore=3,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName=FONTS["body"],
            fontSize=8.7,
            leading=12,
            textColor=TEXT,
            spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName=FONTS["body"],
            fontSize=7.2,
            leading=9,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "table": ParagraphStyle(
            "table",
            parent=base["BodyText"],
            fontName=FONTS["body"],
            fontSize=7.1,
            leading=9.1,
            textColor=TEXT,
        ),
        "table_head": ParagraphStyle(
            "table_head",
            parent=base["BodyText"],
            fontName=FONTS["bold"],
            fontSize=7.3,
            leading=9.2,
            textColor=WHITE,
        ),
        "quote": ParagraphStyle(
            "quote",
            parent=base["BodyText"],
            fontName=FONTS["serif_bold"],
            fontSize=13,
            leading=17,
            textColor=PURPLE_DARK,
            alignment=TA_CENTER,
            spaceBefore=5,
            spaceAfter=5,
        ),
    }


STYLES = make_styles()


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, STYLES[style])


def bullet_list(items: list[str]) -> ListFlowable:
    return ListFlowable(
        [ListItem(p(escape(item), "body"), leftIndent=10) for item in items],
        bulletType="bullet",
        leftIndent=15,
        bulletFontName=FONTS["bold"],
        bulletFontSize=6,
        bulletColor=PURPLE,
    )


def card(title: str, body: str) -> Table:
    table = Table(
        [[p(escape(title), "h3")], [p(escape(body), "body")]],
        colWidths=[2.48 * inch],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT_BG),
                ("BOX", (0, 0), (-1, -1), 0.7, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def two_column_cards(items: list[tuple[str, str]]) -> Table:
    rows = []
    for idx in range(0, len(items), 2):
        row_items = items[idx : idx + 2]
        row = [card(title, body) for title, body in row_items]
        if len(row) == 1:
            row.append("")
        rows.append(row)

    table = Table(rows, colWidths=[2.63 * inch, 2.63 * inch], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def data_table(headers: list[str], rows: list[list[str]], widths: list[float]) -> Table:
    data = [[p(escape(header), "table_head") for header in headers]]
    for row in rows:
        data.append([p(escape(cell), "table") for cell in row])

    table = Table(data, colWidths=[width * inch for width in widths], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PURPLE_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                ("GRID", (0, 0), (-1, -1), 0.55, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def header_footer(title: str):
    def draw(canvas, doc):
        canvas.saveState()
        width, height = letter
        canvas.setFillColor(colors.white)
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.6)
        canvas.line(0.55 * inch, height - 0.42 * inch, width - 0.55 * inch, height - 0.42 * inch)
        canvas.line(0.55 * inch, 0.45 * inch, width - 0.55 * inch, 0.45 * inch)
        canvas.setFont(FONTS["bold"], 7.2)
        canvas.setFillColor(PURPLE_DARK)
        canvas.drawString(0.55 * inch, height - 0.31 * inch, "Vinea Platform")
        canvas.setFillColor(MUTED)
        canvas.drawRightString(width - 0.55 * inch, height - 0.31 * inch, title)
        canvas.setFont(FONTS["body"], 7)
        canvas.drawString(0.55 * inch, 0.28 * inch, "Better Parish Operations. Better Parishioner Care.")
        canvas.drawRightString(width - 0.55 * inch, 0.28 * inch, f"Page {doc.page}")
        canvas.restoreState()

    return draw


def build_pdf(
    filename: str,
    title: str,
    story: list,
    margin_top: float = 0.62,
    margin_bottom: float = 0.62,
    margin_side: float = 0.58,
) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / filename
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        rightMargin=margin_side * inch,
        leftMargin=margin_side * inch,
        topMargin=margin_top * inch,
        bottomMargin=margin_bottom * inch,
        title=title,
        author="Vinea Technologies LLC",
        subject=title,
    )
    doc.build(story, onFirstPage=header_footer(title), onLaterPages=header_footer(title))
    return path


def build_decision_packet_story() -> list:
    story: list = []
    story.extend(
        [
            p("PASTOR AND FINANCE COUNCIL REVIEW", "kicker"),
            p("Vinea Decision Packet", "title"),
            p(
                "A forwardable review packet for Catholic parish leaders evaluating whether Vinea is worth a focused pilot.",
                "subtitle",
            ),
            p("Better Parish Operations. Better Parishioner Care.", "quote"),
            p("Executive Summary", "h2"),
            p(
                "Vinea Platform helps Catholic parish offices manage requests, follow-up, records, scheduling, communication, people, households, and Mass intentions in one simple system.",
            ),
            p(
                "Vinea is most useful for parishes where staff are tracking baptism, funeral, wedding, OCIA, join-parish, records, certificate, scheduling, communication, or Mass intention work across email inboxes, spreadsheets, paper forms, voicemail, sticky notes, and memory.",
            ),
            p("Decision Being Requested", "h2"),
            bullet_list(
                [
                    "Approve a 15-minute workflow demo for the pastor, administrator, business manager, and key office staff.",
                    "Approve a 30- to 45-day pilot focused on one or two parish workflows.",
                    "Approve a procurement review to confirm pricing, implementation scope, data handling, support expectations, and contract terms.",
                ]
            ),
            p("The Problem Vinea Solves", "h2"),
            two_column_cards(
                [
                    ("Scattered intake", "Requests arrive through phone, email, paper forms, walk-ins, web forms, and conversations."),
                    ("Unclear ownership", "Follow-up can depend on one staff member remembering the next step."),
                    ("Disconnected records", "Requests, people, households, scheduling, certificates, and records often live in separate places."),
                    ("Limited visibility", "Pastors and administrators may not have a simple view of open work and overdue follow-up."),
                ]
            ),
            p("What Vinea Helps Manage", "h2"),
            bullet_list(
                [
                    "Baptism, funeral, wedding, OCIA, join-parish, and other parishioner requests.",
                    "Assignments, status, notes, blockers, and follow-up dates.",
                    "Communication history and staff-assisted email drafts.",
                    "Scheduling and optional Google Calendar support.",
                    "People, households, sacramental records, certificate support, and Mass intentions.",
                    "Dashboards for open work, overdue items, and staff visibility.",
                ]
            ),
        ]
    )
    story.append(PageBreak())
    story.extend(
        [
            p("Recommended Pilot Options", "h2"),
            two_column_cards(
                [
                    (
                        "Request Follow-Up Pilot",
                        "Use Vinea for baptism, funeral, wedding, OCIA, and join-parish requests. Success means every request has an owner, next step, and visible status.",
                    ),
                    (
                        "Mass Intentions Pilot",
                        "Use Vinea to organize Mass intention requests, dates, scheduling details, and staff follow-up in one place.",
                    ),
                    (
                        "Records and Certificate Workflow Pilot",
                        "Connect request context, people/households, sacramental records, and certificate-related work without claiming canonical record-of-truth status unless approved.",
                    ),
                    (
                        "Narrow First Step",
                        "Do not try to change every office process at once. Start with one or two workflows where staff already feel administrative burden.",
                    ),
                ]
            ),
            p("Value by Stakeholder", "h2"),
            data_table(
                ["Stakeholder", "What They Care About", "Vinea Value"],
                [
                    ["Pastor", "Visibility, pastoral follow-up, staff coordination", "See what is open, who owns it, and where parishioners need attention."],
                    ["Administrator", "Office consistency and staff workload", "Standard workflows for requests, assignments, follow-up, and records."],
                    ["Business manager", "Responsible vendor review and staff time", "Narrow pilot, clearer workflow ownership, and documented procurement questions."],
                    ["Office secretary", "Daily workload and fewer scattered notes", "One place to track requests, next steps, notes, and communication."],
                    ["Finance council", "Stewardship, cost justification, vendor risk", "Pilot-first decision path, measurable workflow outcomes, and explicit open questions."],
                ],
                [1.1, 1.9, 2.25],
            ),
            p("Suggested 45-Day Pilot Plan", "h2"),
            data_table(
                ["Timing", "Activity", "Outcome"],
                [
                    ["Week 0", "Discovery and workflow selection", "Choose one or two workflows, staff owner, and success criteria."],
                    ["Week 1", "Setup", "Configure the pilot workflow and minimum useful data."],
                    ["Week 2", "Staff training", "Staff understand dashboard, request details, status, notes, and follow-up."],
                    ["Weeks 3-5", "Live pilot", "Staff use Vinea for the selected workflow and track friction."],
                    ["Week 6", "Review", "Decide whether to continue, expand, pause, or stop."],
                ],
                [0.85, 1.95, 2.45],
            ),
        ]
    )
    story.append(PageBreak())
    story.extend(
        [
            p("Procurement Questions", "h2"),
            data_table(
                ["Question", "Current Answer", "Status"],
                [
                    ["Pricing", "Pricing should be quoted for the specific parish, pilot scope, and support expectations.", "To confirm"],
                    ["Contract term", "Pilot and annual options should be confirmed before proposal.", "To confirm"],
                    ["Parish data ownership", "Recommended contract position: the parish owns its parish data.", "Recommended copy after approval"],
                    ["Data export", "Policy proposal and non-production evidence exist for limited export workflows. Production export controls are not yet complete.", "To confirm before contract"],
                    ["Backups/restores", "Runbook and non-production replay plus app/auth smoke evidence exist. Production restore drill and final terms are pending.", "To confirm before contract"],
                    ["Incident response", "Runbook exists. Named owners, drills, and customer-facing commitments are pending.", "To confirm before contract"],
                    ["Retention/deletion", "Policy proposal exists. Legal approval, customer policy approval, and production automation are pending.", "To confirm before contract"],
                    ["Integrations", "Optional Google Calendar support is part of product scope. Other integrations should be verified parish by parish.", "To confirm"],
                ],
                [1.15, 3.0, 1.1],
            ),
            p("Finance Council Checklist", "h2"),
            bullet_list(
                [
                    "Which workflow will Vinea improve first?",
                    "Who on staff will own the pilot?",
                    "What success will look like after 30 to 45 days?",
                    "Pricing and contract term.",
                    "Data ownership, export, offboarding, privacy, retention, deletion, and incident response terms.",
                    "Backup/restore expectations, support terms, and whether diocesan review is required.",
                ]
            ),
            p("Recommended Close", "h2"),
            p(
                "Based on what you shared, I would not recommend trying to change every office process at once. The responsible next step would be a small pilot around the workflow where your staff already feels the most pain.",
            ),
        ]
    )
    return story


def build_trust_story() -> list:
    story: list = []
    story.extend(
        [
            p("TRUST AND PROCUREMENT OVERVIEW", "kicker"),
            p("Vinea Trust and Security One-Pager", "title"),
            p(
                "A plain-language sales-support document for parish administrators, pastors, business managers, and finance councils.",
                "subtitle",
            ),
            p(
                "This is not a legal document, security certification, public trust center, privacy policy, data processing agreement, or final contract exhibit.",
                "small",
            ),
            p("Trust Positioning", "h2"),
            p(
                "Vinea is built for Catholic parish office workflows that can involve sensitive parishioner, family, sacramental, scheduling, and communication information. Vinea is early, and parish data stewardship questions should be handled transparently rather than overstated.",
            ),
            p("Current Factual Posture", "h2"),
            bullet_list(
                [
                    "Vinea is a web application built with Next.js and Supabase.",
                    "Staff access is designed around authenticated staff dashboards.",
                    "Public family intake forms are separated from staff administrative workflows.",
                    "Vinea product workflows include parish requests, people, households, sacramental records, certificates, scheduling, communication, and Mass intentions.",
                    "AI-assisted features should be positioned as staff-support tools for summaries or drafts, not autonomous pastoral or administrative decision-making.",
                ]
            ),
            p("What Can Be Said Today", "h2"),
            data_table(
                ["Area", "Safe Statement", "Status"],
                [
                    ["Incident response", "Incident response runbook prepared covering severity, evidence preservation, containment, recovery, communication, production gates, and postmortems.", "Owners and drill to confirm"],
                    ["Retention/deletion", "Retention/deletion policy proposal prepared for operational data, documents, audit logs, AI outputs, offboarding, and sacramental exceptions.", "Approval and automation to confirm"],
                    ["Export/access", "Export and access-control policy proposal prepared with non-production QA for limited export and manifest workflows.", "Production controls to confirm"],
                    ["Backups/restores", "Backup/restore runbook prepared with non-production disposable database replay plus app/auth smoke evidence.", "Production restore drill to confirm"],
                    ["Official records", "Vinea can support sacramental records and certificate workflows.", "Record-of-truth role to confirm"],
                ],
                [1.05, 3.05, 1.15],
            ),
            p("Do Not Claim Yet", "h2"),
            bullet_list(
                [
                    "SOC 2, ISO 27001, HIPAA, PCI, final diocesan approval, or guaranteed integrations unless formally obtained.",
                    "Completed production export/offboarding controls or production restore drills until approved and verified.",
                    "Approved legal retention/deletion policy, automated deletion for all parish data, or deletion of canonical sacramental records on demand.",
                    "Customer logos, case studies, or measurable ROI unless approved and documented.",
                ]
            ),
            p("Before Contract, Confirm", "h2"),
            p(
                "Pricing, contract term, data ownership, privacy terms, access roles, export/offboarding, backup/restore commitments, incident notification, support expectations, retention/deletion policy, sacramental exceptions, and any diocesan questionnaire requirements.",
            ),
        ]
    )
    return story


def html_shell(title: str, kicker: str, sections: list[tuple[str, list[str]]]) -> str:
    section_html = []
    for heading, paragraphs in sections:
        section_html.append(f"<section><h2>{escape(heading)}</h2>")
        for paragraph in paragraphs:
            if paragraph.startswith("- "):
                items = [line[2:] for line in paragraph.splitlines() if line.startswith("- ")]
                section_html.append("<ul>" + "".join(f"<li>{escape(item)}</li>" for item in items) + "</ul>")
            else:
                section_html.append(f"<p>{escape(paragraph)}</p>")
        section_html.append("</section>")

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{escape(title)}</title>
    <style>
      :root {{
        --purple: #5b21b6;
        --purple-dark: #2e1065;
        --purple-muted: #f1edff;
        --gold: #c99a2e;
        --ink: #111827;
        --text: #374151;
        --muted: #6b7280;
        --border: #e5e7eb;
        --soft-bg: #f8fafc;
      }}
      * {{ box-sizing: border-box; }}
      body {{
        margin: 0;
        background: #f3f4f6;
        color: var(--text);
        font-family: "Segoe UI", Arial, sans-serif;
        line-height: 1.55;
      }}
      .page {{
        width: min(8.5in, 100%);
        margin: 0 auto;
        background: white;
        padding: 0.55in;
      }}
      header {{
        border-bottom: 2px solid var(--gold);
        padding-bottom: 18px;
        margin-bottom: 24px;
      }}
      .kicker {{
        color: var(--purple-dark);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }}
      h1 {{
        color: var(--ink);
        font-family: Georgia, serif;
        font-size: 34px;
        line-height: 1.1;
        margin: 8px 0;
      }}
      h2 {{
        color: var(--purple-dark);
        font-size: 17px;
        margin: 26px 0 8px;
      }}
      p, li {{
        font-size: 14px;
      }}
      ul {{
        padding-left: 20px;
      }}
      .promise {{
        display: inline-block;
        border: 1px solid #ddd6fe;
        border-radius: 999px;
        background: var(--purple-muted);
        color: var(--purple-dark);
        font-weight: 800;
        padding: 7px 12px;
        margin-top: 8px;
      }}
      .note {{
        margin-top: 26px;
        border: 1px solid var(--border);
        background: var(--soft-bg);
        border-radius: 14px;
        padding: 14px 16px;
        color: var(--muted);
        font-size: 12px;
      }}
      @media print {{
        body {{ background: white; }}
        .page {{ width: auto; padding: 0.45in; }}
      }}
    </style>
  </head>
  <body>
    <main class="page">
      <header>
        <div class="kicker">{escape(kicker)}</div>
        <h1>{escape(title)}</h1>
        <div class="promise">Better Parish Operations. Better Parishioner Care.</div>
      </header>
      {''.join(section_html)}
      <p class="note">Prepared by Vinea Technologies LLC as a sales-support document. Procurement-sensitive items should be confirmed before customer-facing contract commitments.</p>
    </main>
  </body>
</html>
"""


def build_html_files() -> list[Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = [
        (
            "vinea-pastor-finance-council-decision-packet.html",
            "Vinea Pastor and Finance Council Decision Packet",
            "Pastor and finance council review",
            [
                (
                    "Executive Summary",
                    [
                        "Vinea Platform helps Catholic parish offices manage requests, follow-up, records, scheduling, communication, people, households, and Mass intentions in one simple system.",
                        "The recommended next step is a narrow pilot around one or two workflows where the office already feels real administrative burden.",
                    ],
                ),
                (
                    "Best-Fit Workflows",
                    [
                        "- Baptism, funeral, wedding, OCIA, and join-parish requests.",
                        "- Assignments, notes, status, blockers, and follow-up dates.",
                        "- People, households, sacramental records, certificate support, scheduling, and Mass intentions.",
                    ],
                ),
                (
                    "Procurement Guardrails",
                    [
                        "Pricing, contract term, production export/offboarding commitments, production restore commitments, and final retention/deletion terms should be confirmed before contract.",
                        "Vinea should not be presented as a parish accounting, payroll, or giving platform, or as the canonical sacramental record of truth unless parish and diocesan policy approve that role.",
                    ],
                ),
            ],
        ),
        (
            "vinea-trust-security-one-pager.html",
            "Vinea Trust and Security One-Pager",
            "Trust and procurement overview",
            [
                (
                    "Current Factual Posture",
                    [
                        "Vinea is a web application built with Next.js and Supabase. Staff access is designed around authenticated staff dashboards, and public family intake forms are separated from staff administrative workflows.",
                        "AI-assisted features should be positioned as staff-support tools for summaries or drafts, not autonomous pastoral or administrative decision-making.",
                    ],
                ),
                (
                    "Prepared Materials",
                    [
                        "- Incident response runbook prepared; owners and drill to confirm.",
                        "- Retention/deletion policy proposal prepared; approval and automation to confirm.",
                        "- Export/access-control policy proposal and non-production QA prepared; production controls to confirm.",
                        "- Backup/restore runbook and non-production replay evidence prepared; production restore drill to confirm.",
                    ],
                ),
                (
                    "Do Not Claim Yet",
                    [
                        "Do not claim SOC 2, ISO 27001, HIPAA, PCI, final diocesan approval, customer proof, completed production export/offboarding controls, or completed production restore drills unless formally obtained and documented.",
                    ],
                ),
            ],
        ),
    ]

    written: list[Path] = []
    for filename, title, kicker, sections in files:
        path = OUT_DIR / filename
        path.write_text(html_shell(title, kicker, sections), encoding="utf-8")
        written.append(path)
    return written


def main() -> None:
    pdfs = [
        build_pdf(
            "vinea-pastor-finance-council-decision-packet.pdf",
            "Pastor and Finance Council Decision Packet",
            build_decision_packet_story(),
        ),
        build_pdf(
            "vinea-trust-security-one-pager.pdf",
            "Trust and Security One-Pager",
            build_trust_story(),
            margin_top=0.5,
            margin_bottom=0.5,
            margin_side=0.52,
        ),
    ]
    html_files = build_html_files()
    print("Generated sales procurement attachments:")
    for path in pdfs + html_files:
        print(f"- {path}")


if __name__ == "__main__":
    main()
