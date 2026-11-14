export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  if (at <= 0) return '***';

  return `${email.slice(0, 1)}***${email.slice(at)}`;
}
