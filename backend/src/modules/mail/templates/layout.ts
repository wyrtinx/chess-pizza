import type { MailLocale } from './mail-template.types.js';

// Brand tokens from the Figma foundations (sand, ink, orange).
export const MAIL_COLORS = {
  page: '#f5ead8',
  card: '#f9f4ed',
  border: '#e3d3b7',
  heading: '#201e1d',
  body: '#39342b',
  muted: '#6a6154',
  accent: '#aa5921',
  onAccent: '#ffffff',
} as const;

const FONT_STACK = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const FOOTER: Record<MailLocale, string> = {
  uk: 'Цей лист надіслано автоматично, відповідати на нього не потрібно.',
  en: 'This email was sent automatically, please do not reply.',
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function paragraph(html: string): string {
  return `<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: ${MAIL_COLORS.body};">${html}</p>`;
}

export function mutedParagraph(html: string): string {
  return `<p style="margin: 0 0 12px; font-size: 14px; line-height: 20px; color: ${MAIL_COLORS.muted};">${html}</p>`;
}

interface HtmlLayoutOptions {
  locale: MailLocale;
  title: string;
  preheader: string;
  content: string;
}

// Table layout with inline styles: the only thing that renders the same in Gmail, Outlook and Apple Mail.
export function renderHtmlLayout({ locale, title, preheader, content }: HtmlLayoutOptions): string {
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${MAIL_COLORS.page};">
<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${MAIL_COLORS.page};">
<tr>
<td align="center" style="padding: 32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; font-family: ${FONT_STACK};">
<tr>
<td style="padding: 0 8px 16px; font-size: 22px; font-weight: 700; color: ${MAIL_COLORS.heading};">Chess Pizza</td>
</tr>
<tr>
<td style="padding: 32px; background-color: ${MAIL_COLORS.card}; border: 1px solid ${MAIL_COLORS.border}; border-radius: 16px;">
${content}
</td>
</tr>
<tr>
<td style="padding: 16px 8px 0; font-size: 12px; line-height: 18px; color: ${MAIL_COLORS.muted};">${escapeHtml(FOOTER[locale])}</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;
}

export function renderTextLayout(locale: MailLocale, blocks: string[]): string {
  return [...blocks, `—\nChess Pizza\n${FOOTER[locale]}`].join('\n\n') + '\n';
}
