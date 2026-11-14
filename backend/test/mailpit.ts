// Mailpit HTTP API: https://mailpit.axllent.org/docs/api-v1/

export interface MailpitAddress {
  Name: string;
  Address: string;
}

export interface MailpitMessage {
  ID: string;
  From: MailpitAddress;
  To: MailpitAddress[];
  Subject: string;
  Text: string;
  HTML: string;
}

interface MailpitSearchResult {
  messages: { ID: string }[];
}

const POLL_INTERVAL_MS = 100;

function apiUrl(path: string, query?: string): string {
  const base = process.env.MAILPIT_API_URL;
  if (base === undefined || base === '') {
    throw new Error('MAILPIT_API_URL is not set: add it to .env.test (see .env.example)');
  }

  const url = new URL(path, base);
  if (query !== undefined) url.searchParams.set('query', query);
  return url.toString();
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Mailpit responded ${response.status} for ${url}`);
  return response.json();
}

const toQuery = (to: string): string => `to:"${to}"`;

async function pollForId(to: string, deadline: number): Promise<string> {
  const result = await request<MailpitSearchResult>(apiUrl('/api/v1/search', toQuery(to)));
  const id = result.messages[0]?.ID;
  if (id !== undefined) return id;

  if (Date.now() > deadline) throw new Error(`No mail for ${to} in Mailpit`);
  await Bun.sleep(POLL_INTERVAL_MS);
  return pollForId(to, deadline);
}

/** Waits for the latest message sent to `to` and returns it with both bodies. */
export async function waitForMail(to: string, timeoutMs = 5000): Promise<MailpitMessage> {
  const id = await pollForId(to, Date.now() + timeoutMs);
  return request<MailpitMessage>(apiUrl(`/api/v1/message/${id}`));
}

export async function deleteMail(to: string): Promise<void> {
  const response = await fetch(apiUrl('/api/v1/search', toQuery(to)), { method: 'DELETE' });
  if (!response.ok) throw new Error(`Mailpit responded ${response.status} on delete`);
}
