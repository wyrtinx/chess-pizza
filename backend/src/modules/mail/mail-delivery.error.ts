import { maskEmail } from './mask-email.js';

const escapeRegExp = (value: string): string =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const readString = (source: object, key: string): string | undefined => {
  const value: unknown = Reflect.get(source, key);
  return typeof value === 'string' ? value : undefined;
};

const readNumber = (source: object, key: string): number | undefined => {
  const value: unknown = Reflect.get(source, key);
  return typeof value === 'number' ? value : undefined;
};

// Nodemailer errors may quote the recipient (message, response, rejected), so only safe fields are kept.
export class MailDeliveryError extends Error {
  override readonly name = 'MailDeliveryError';
  readonly code: string | undefined;
  readonly responseCode: number | undefined;
  readonly command: string | undefined;

  constructor(error: unknown, recipient: string) {
    const address = new RegExp(escapeRegExp(recipient), 'gi');
    const hide = (text: string): string => text.replace(address, maskEmail(recipient));

    super(error instanceof Error ? hide(error.message) : 'Unknown mail delivery error');

    if (error instanceof Error) {
      this.stack = error.stack === undefined ? undefined : hide(error.stack);
      this.code = readString(error, 'code');
      this.responseCode = readNumber(error, 'responseCode');
      this.command = readString(error, 'command');
    }
  }
}
