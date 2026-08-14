import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

export interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export interface LinkMetadataCacheEntry {
  fetchedAt: number;
  metadata: LinkMetadata;
}

export type LinkMetadataCache = Record<string, LinkMetadataCacheEntry>;

export type LookupAddresses = (
  hostname: string,
) => Promise<Array<{ address: string; family: number }>>;

export interface ResolveLinkOptions {
  fetch?: typeof globalThis.fetch;
  lookup?: LookupAddresses;
  maxBytes?: number;
  maxRedirects?: number;
  timeoutMs?: number;
}

const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8_000;

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function absoluteUrl(value: string | undefined, base: URL): string | undefined {
  if (!value) return undefined;
  try {
    const resolved = new URL(value, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? resolved.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function parseLinkMetadata(html: string, requestedUrl: string): LinkMetadata {
  const base = new URL(requestedUrl);
  const values = new Map<string, string>();
  let favicon: string | undefined;

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag);
    const key = (attributes.property ?? attributes.name)?.toLowerCase();
    if (key && attributes.content && !values.has(key)) values.set(key, attributes.content);
  }

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag);
    const relationships = attributes.rel?.toLowerCase().split(/\s+/) ?? [];
    if (
      relationships.some((relationship) => relationship === 'icon' || relationship === 'shortcut')
    ) {
      favicon = absoluteUrl(attributes.href, base);
      if (favicon) break;
    }
  }

  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title = values.get('og:title') ?? values.get('twitter:title') ?? titleTag;
  const description =
    values.get('og:description') ?? values.get('twitter:description') ?? values.get('description');

  return {
    url: base.toString(),
    title: title ? decodeHtml(title.replace(/<[^>]+>/g, '')) : undefined,
    description: description ? decodeHtml(description) : undefined,
    image: absoluteUrl(values.get('og:image') ?? values.get('twitter:image'), base),
    siteName: values.get('og:site_name') ? decodeHtml(values.get('og:site_name')!) : undefined,
    favicon: favicon ?? new URL('/favicon.ico', base).toString(),
  };
}

function isPrivateAddress(address: string): boolean {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('ff') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.')
    );
  }

  return true;
}

export async function assertPublicUrl(
  value: string,
  lookup: LookupAddresses = (hostname) => dns.lookup(hostname, { all: true, verbatim: true }),
): Promise<URL> {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Only HTTP links can be embedded');
  if (url.username || url.password) throw new Error('Link URLs cannot contain credentials');
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
    throw new Error('Private network links cannot be embedded');
  }

  const addresses = await lookup(url.hostname);
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Private network links cannot be embedded');
  }

  return url;
}

async function readLimitedBody(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength > maxBytes) throw new Error(`Link response exceeds ${maxBytes} bytes`);
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new Error(`Link response exceeds ${maxBytes} bytes`);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export async function resolveLinkMetadata(
  value: string,
  options: ResolveLinkOptions = {},
): Promise<LinkMetadata> {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const lookup =
    options.lookup ?? ((hostname: string) => dns.lookup(hostname, { all: true, verbatim: true }));
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  let url = await assertPublicUrl(value, lookup);

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const response = await fetchImpl(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'docusaurus-plugin-embeds/0.1',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirects === maxRedirects) throw new Error('Link has too many redirects');
      url = await assertPublicUrl(new URL(location, url).toString(), lookup);
      continue;
    }

    if (!response.ok) throw new Error(`Link returned ${response.status}`);
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('Link did not return HTML');
    }

    return parseLinkMetadata(await readLimitedBody(response, maxBytes), url.toString());
  }

  throw new Error('Link has too many redirects');
}

export async function readLinkCache(cacheFile: string): Promise<LinkMetadataCache> {
  try {
    return JSON.parse(await fs.readFile(cacheFile, 'utf8')) as LinkMetadataCache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

export async function writeLinkCache(cacheFile: string, cache: LinkMetadataCache): Promise<void> {
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.writeFile(cacheFile, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

export async function resolveLinksWithCache(
  urls: string[],
  cacheFile: string,
  ttlMs: number,
  options: ResolveLinkOptions = {},
): Promise<LinkMetadataCache> {
  const cache = await readLinkCache(cacheFile);
  const now = Date.now();

  await Promise.all(
    [...new Set(urls)].map(async (url) => {
      const cached = cache[url];
      if (cached && now - cached.fetchedAt < ttlMs) return;
      try {
        cache[url] = { fetchedAt: now, metadata: await resolveLinkMetadata(url, options) };
      } catch (error) {
        if (!cached) console.warn(`[docusaurus-plugin-embeds] ${url}: ${(error as Error).message}`);
      }
    }),
  );

  await writeLinkCache(cacheFile, cache);
  return Object.fromEntries(urls.flatMap((url) => (cache[url] ? [[url, cache[url]]] : [])));
}
