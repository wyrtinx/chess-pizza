export const MAIL_TRANSPORTER = Symbol('MAIL_TRANSPORTER');

// Nodemailer defaults (2 min to connect, 10 min idle) would hang the request that sends the mail.
export const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
export const SMTP_GREETING_TIMEOUT_MS = 10_000;
export const SMTP_SOCKET_TIMEOUT_MS = 30_000;
