"""
Generador de invitaciones PDF - Primera Comunión Mario Alejandro
Genera un PDF elegante por familia con su link personalizado.
"""

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
import os, math

# ── Paleta de colores ─────────────────────────────────────────────
GOLD        = HexColor('#c9a84c')
GOLD_LIGHT  = HexColor('#e8d08a')
GOLD_PALE   = HexColor('#f5ecd0')
IVORY       = HexColor('#faf7f0')
BLUE        = HexColor('#3a5a8c')
BLUE_LIGHT  = HexColor('#7896c4')
DARK        = HexColor('#2d2416')
MID         = HexColor('#5a4a2a')
CREAM       = HexColor('#f2ead8')

BASE_URL = "https://marioalejandrocomunion.github.io/invitacion/"

W, H = A4   # 595.28 x 841.89 pt


def draw_border(c):
    """Marco dorado exterior + interior."""
    margin = 18
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.8)
    c.rect(margin, margin, W - 2*margin, H - 2*margin)
    inner = margin + 6
    c.setLineWidth(0.6)
    c.rect(inner, inner, W - 2*inner, H - 2*inner)

    # Esquinas decorativas
    size = 22
    corners = [
        (margin, H - margin),
        (W - margin, H - margin),
        (margin, margin),
        (W - margin, margin),
    ]
    for (cx, cy) in corners:
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.2)
        # pequeña cruz en esquina
        c.line(cx - size//2, cy, cx + size//2, cy)
        c.line(cx, cy - size//2, cx, cy + size//2)


def draw_ornament_line(c, y, x1=None, x2=None):
    """Línea dorada con rombo central."""
    if x1 is None: x1 = 50
    if x2 is None: x2 = W - 50
    mid = (x1 + x2) / 2
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.setFillColor(GOLD)
    # líneas izq / der
    c.line(x1, y, mid - 10, y)
    c.line(mid + 10, y, x2, y)
    # rombo central
    c.saveState()
    c.translate(mid, y)
    c.rotate(45)
    c.rect(-5, -5, 10, 10, fill=1, stroke=0)
    c.restoreState()


def draw_cross(c, cx, cy, arm=18, thick=5):
    """Cruz simple dorada."""
    c.setFillColor(GOLD)
    c.setStrokeColor(GOLD)
    c.rect(cx - thick/2, cy - arm, thick, arm*2, fill=1, stroke=0)
    c.rect(cx - arm, cy - thick/2 + 4, arm*2, thick, fill=1, stroke=0)


def draw_stars(c, y_center, count=5, spread=120):
    """Pequeñas estrellas decorativas."""
    c.setFillColor(GOLD)
    c.setFont("Helvetica", 7)
    step = spread / (count - 1) if count > 1 else 0
    for i in range(count):
        x = W/2 - spread/2 + i * step
        c.drawCentredString(x, y_center, "✦")


def link_rect(c, url, x, y, w, h):
    """Rectángulo clicable (link) en el PDF."""
    from reportlab.lib.utils import simpleSplit
    c.linkURL(url, (x, y, x+w, y+h), relative=0)


def generate_invitation(family_name: str, max_guests: int, family_id: str, out_path: str):
    url = f"{BASE_URL}?familia={family_id}"

    cv = canvas.Canvas(out_path, pagesize=A4)
    cv.setTitle(f"Invitación – {family_name}")

    # ── Fondo marfil ─────────────────────────────────────────────
    cv.setFillColor(IVORY)
    cv.rect(0, 0, W, H, fill=1, stroke=0)

    # Sutil textura de puntos dorados
    cv.setFillColor(HexColor('#e8d08a'))
    cv.setFillAlpha(0.08)
    for row in range(0, int(H), 28):
        for col in range(0, int(W), 28):
            cv.circle(col, row, 1.2, fill=1, stroke=0)
    cv.setFillAlpha(1)

    # ── Marco ────────────────────────────────────────────────────
    draw_border(cv)

    # ── Cruz superior ────────────────────────────────────────────
    draw_cross(cv, W/2, H - 68, arm=20, thick=6)

    # ── "Con la gracia de Dios" ───────────────────────────────────
    y = H - 110
    cv.setFont("Helvetica", 7)
    cv.setFillColor(MID)
    text = "✦  CON LA GRACIA DE DIOS  ✦"
    cv.drawCentredString(W/2, y, text)

    draw_ornament_line(cv, y - 14, 70, W - 70)

    # ── "Tengo el honor…" ─────────────────────────────────────────
    y -= 36
    cv.setFont("Helvetica-Oblique", 9.5)
    cv.setFillColor(MID)
    cv.drawCentredString(W/2, y, "Tengo el honor de invitarle a celebrar")

    # ── Nombre del niño ───────────────────────────────────────────
    y -= 52
    cv.setFont("Helvetica-BoldOblique", 30)
    cv.setFillColor(BLUE)
    cv.drawCentredString(W/2, y, "Mario Alejandro")

    # Línea bajo nombre
    y -= 14
    draw_ornament_line(cv, y, 80, W - 80)

    # ── "Mi" en cursiva dorada ────────────────────────────────────
    y -= 30
    cv.setFont("Helvetica-Oblique", 13)
    cv.setFillColor(GOLD)
    cv.drawCentredString(W/2, y, "✦   Mi   ✦")

    # ── Título principal ──────────────────────────────────────────
    y -= 46
    cv.setFont("Helvetica-Bold", 26)
    cv.setFillColor(DARK)
    cv.drawCentredString(W/2, y, "Sagrada Primera")
    y -= 32
    cv.drawCentredString(W/2, y, "Comunión")

    # Estrellas decorativas
    y -= 20
    draw_stars(cv, y, count=7, spread=160)

    # ── Fecha badge ───────────────────────────────────────────────
    y -= 54
    bw, bh = 200, 72
    bx = W/2 - bw/2
    # Fondo blanco semitransparente
    cv.setFillColor(colors.white)
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(1.2)
    cv.roundRect(bx, y - bh + 20, bw, bh, 4, fill=1, stroke=1)

    # Día
    cv.setFont("Helvetica-Bold", 28)
    cv.setFillColor(GOLD)
    cv.drawCentredString(W/2, y - 2, "20")
    # Mes
    cv.setFont("Helvetica", 11)
    cv.setFillColor(MID)
    cv.drawCentredString(W/2, y - 22, "J U N I O")
    # Año
    cv.setFont("Helvetica", 8)
    cv.setFillColor(HexColor('#7a6040'))
    cv.drawCentredString(W/2, y - 38, "2 0 2 6")

    # ── Sección HORARIO ───────────────────────────────────────────
    y -= bh + 14
    draw_ornament_line(cv, y, 50, W - 50)

    y -= 22
    cv.setFont("Helvetica", 7)
    cv.setFillColor(BLUE_LIGHT)
    cv.drawCentredString(W/2, y, "P R O G R A M A  D E L  D Í A")

    # Ceremonia
    y -= 22
    cv.setFillColor(BLUE)
    cv.setStrokeColor(BLUE)
    cv.rect(50, y - 2, W - 100, 20, fill=1, stroke=0)
    cv.setFillColor(colors.white)
    cv.setFont("Helvetica-Bold", 8.5)
    cv.drawString(60, y + 4, "⛪  12:00 PM  ·  Ceremonia Religiosa")

    y -= 16
    cv.setFillColor(DARK)
    cv.setFont("Helvetica", 8)
    cv.drawCentredString(W/2, y, "Santuario de la Virgen de Guadalupe · Santa Misa de Primera Comunión")

    # Festejo
    y -= 22
    cv.setFillColor(GOLD)
    cv.setStrokeColor(GOLD)
    cv.rect(50, y - 2, W - 100, 20, fill=1, stroke=0)
    cv.setFillColor(DARK)
    cv.setFont("Helvetica-Bold", 8.5)
    cv.drawString(60, y + 4, "🎉  2:30 PM  ·  Recepción & Festejo")

    y -= 16
    cv.setFillColor(MID)
    cv.setFont("Helvetica", 8)
    cv.drawCentredString(W/2, y, "Salón La Puerta · San Judas Tadeo #204, Col. Las Flores (Ciudad Perdida)")

    # ── Familia ───────────────────────────────────────────────────
    y -= 28
    draw_ornament_line(cv, y, 50, W - 50)

    y -= 20
    cv.setFont("Helvetica", 7)
    cv.setFillColor(BLUE_LIGHT)
    cv.drawCentredString(W/2, y, "C O N  E L  A M O R  D E")

    y -= 18
    cv.setFont("Helvetica", 9)
    cv.setFillColor(MID)
    cv.drawCentredString(W/2, y, "María Guadalupe Arias Romo  &  Mario Alberto Pérez Aguirre")

    y -= 14
    cv.setFont("Helvetica-Oblique", 8)
    cv.setFillColor(GOLD)
    cv.drawCentredString(W/2, y, "Padrinos:  Raúl Arias Romo  &  Silvia Pedroza Cuéllar")

    # ── Oración ───────────────────────────────────────────────────
    y -= 26
    cv.setFillColor(GOLD_PALE)
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(0.6)
    cv.roundRect(44, y - 62, W - 88, 72, 3, fill=1, stroke=1)

    cv.setFont("Helvetica-Oblique", 8.2)
    cv.setFillColor(MID)
    prayer_lines = [
        "Jesús mío, que hoy vienes a mí por primera vez,",
        "ilumina mi alma con la luz de la fe",
        "y haz que el recuerdo de este hermoso día",
        "perdure siempre en mí.",
    ]
    py = y + 2
    for line in prayer_lines:
        cv.drawCentredString(W/2, py, line)
        py -= 13
    cv.setFont("Helvetica-Bold", 8)
    cv.setFillColor(GOLD)
    cv.drawCentredString(W/2, py - 2, "Amén")

    # ── Sección personalizada: familia invitada ───────────────────
    y -= 86
    draw_ornament_line(cv, y, 50, W - 50)

    y -= 22
    cv.setFont("Helvetica", 7)
    cv.setFillColor(BLUE_LIGHT)
    cv.drawCentredString(W/2, y, "I N V I T A C I Ó N  E S P E C I A L  P A R A")

    y -= 22
    cv.setFont("Helvetica-Bold", 15)
    cv.setFillColor(BLUE)
    cv.drawCentredString(W/2, y, family_name)

    y -= 16
    guest_text = f"Lugares reservados:  {max_guests}  {'persona' if max_guests == 1 else 'personas'}"
    cv.setFont("Helvetica", 9)
    cv.setFillColor(DARK)
    cv.drawCentredString(W/2, y, guest_text)

    # ── Link / QR placeholder ─────────────────────────────────────
    y -= 28
    lw, lh = W - 100, 58
    lx = 50
    cv.setFillColor(BLUE)
    cv.roundRect(lx, y - lh + 12, lw, lh, 5, fill=1, stroke=0)

    cv.setFont("Helvetica", 7)
    cv.setFillColor(HexColor('#a0b8d8'))
    cv.drawCentredString(W/2, y - 4, "Confirma tu asistencia en:")

    cv.setFont("Helvetica-Bold", 8)
    cv.setFillColor(GOLD_LIGHT)
    cv.drawCentredString(W/2, y - 18, url)

    # Aviso fecha límite — dentro del botón azul
    cv.setFont("Helvetica-BoldOblique", 7)
    cv.setFillColor(HexColor('#ffd980'))
    cv.drawCentredString(W/2, y - 34, "📅  Fecha límite para confirmar:  1 de Junio de 2026")

    # Hacer el botón clicable
    link_rect(cv, url, lx, y - lh + 12, lw, lh)

    # ── Footer ────────────────────────────────────────────────────
    y = 38
    cv.setFont("Helvetica-Oblique", 7.5)
    cv.setFillColor(GOLD)
    cv.drawCentredString(W/2, y,
        '"Dejad que los niños vengan a mí, porque de ellos es el Reino de los Cielos."')
    y -= 13
    cv.setFont("Helvetica", 6.5)
    cv.setFillColor(MID)
    cv.drawCentredString(W/2, y, "MARIO ALEJANDRO  ·  PRIMERA COMUNIÓN  ·  20 DE JUNIO 2026")

    cv.save()
    print(f"✓ PDF generado: {out_path}")


# ── Familias de ejemplo ───────────────────────────────────────────
sample_families = [
    {"name": "Familia Rodríguez López",  "guests": 4, "id": "fam_001"},
    {"name": "Familia Martínez García",  "guests": 2, "id": "fam_002"},
    {"name": "Familia Hernández Ruiz",   "guests": 6, "id": "fam_003"},
]

os.makedirs("/home/claude/pdfs", exist_ok=True)

for f in sample_families:
    fname = f["name"].replace(" ", "_").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u")
    out   = f"/home/claude/pdfs/Invitacion_{fname}.pdf"
    generate_invitation(f["name"], f["guests"], f["id"], out)

print("\nTodos los PDFs generados correctamente.")
