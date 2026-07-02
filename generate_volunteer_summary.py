from pathlib import Path
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

html_path = Path('volunteer-descriptions.html')
if not html_path.exists():
    raise FileNotFoundError(f"{html_path} not found")

html = html_path.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')
entries = []
for art in soup.select('article.desc-entry'):
    title_el = art.select_one('.desc-entry-title')
    title = title_el.get_text(strip=True) if title_el else 'Untitled'
    website_el = art.select_one('a.desc-website-link')
    website = website_el['href'].strip() if website_el and website_el.has_attr('href') else ''
    duties = ''
    qualifications = ''
    for block in art.select('.info-block'):
        label_el = block.select_one('.info-block-label')
        value_el = block.select_one('.info-block-value')
        if not label_el or not value_el:
            continue
        label = label_el.get_text(strip=True).lower()
        value = ' '.join(value_el.get_text(' ', strip=True).split())
        if 'dutie' in label or 'respons' in label or 'schedule' in label:
            duties = value
        elif 'qualif' in label:
            qualifications = value
    if not duties:
        desc_text = art.select_one('.desc-text')
        if desc_text:
            duties = ' '.join(desc_text.get_text(' ', strip=True).split())
    entries.append({'title': title, 'website': website, 'duties': duties, 'qualifications': qualifications})

summary_lines = [
    'Simi Volunteering - Current Volunteer Opportunities',
    'Website: https://simivolunteering.netlify.app/',
    '',
]
for i, e in enumerate(entries, 1):
    summary_lines.append(f"{i}. {e['title']}")
    if e['duties']:
        summary_lines.append(f"   Duties: {e['duties']}")
    if e['qualifications']:
        summary_lines.append(f"   Qualifications: {e['qualifications']}")
    if e['website']:
        summary_lines.append(f"   Website: {e['website']}")
    summary_lines.append('')

text_path = Path('volunteer-summary.txt')
text_path.write_text('\n'.join(summary_lines), encoding='utf-8')

pdf_path = Path('Simi-Volunteering-Opportunities.pdf')
doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=40, leftMargin=40, topMargin=60, bottomMargin=60)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleLarge', fontSize=20, leading=24, spaceAfter=16, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='Heading', fontSize=14, leading=18, spaceAfter=10, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='Body', fontSize=11, leading=15, spaceAfter=8, alignment=TA_LEFT))

story = []
story.append(Paragraph('Simi Volunteering - Current Volunteer Opportunities', styles['TitleLarge']))
story.append(Paragraph('Website: https://simivolunteering.netlify.app/', styles['Body']))
story.append(Spacer(1, 12))
for i, e in enumerate(entries, 1):
    story.append(Paragraph(f"<b>{i}. {e['title']}</b>", styles['Heading']))
    if e['duties']:
        story.append(Paragraph(f"<b>Duties:</b> {e['duties']}", styles['Body']))
    if e['qualifications']:
        story.append(Paragraph(f"<b>Qualifications:</b> {e['qualifications']}", styles['Body']))
    if e['website']:
        link = e['website']
        story.append(Paragraph(f"<b>Website:</b> <font color='blue'><a href='{link}' color='blue'>{link}</a></font>", styles['Body']))
    story.append(Spacer(1, 8))
story.append(Spacer(1, 12))
story.append(Paragraph('This summary is generated from the Simi Volunteering website and includes current volunteer opportunities, qualifications, and website links.', styles['Body']))
doc.build(story)
print(f'Generated {text_path} and {pdf_path} with {len(entries)} entries.')
