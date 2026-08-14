// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  assertPublicUrl,
  parseLinkMetadata,
  resolveLinkMetadata,
  resolveLinksWithCache,
} from './linkMetadata';

const publicLookup = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);

describe('link metadata', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses Open Graph metadata before standard fallbacks', () => {
    const metadata = parseLinkMetadata(
      `<html><head>
        <title>HTML title</title>
        <meta name="description" content="HTML description">
        <meta property="og:title" content="OG &amp; title">
        <meta property="og:description" content="OG description">
        <meta property="og:image" content="/cover.jpg">
        <meta property="og:site_name" content="Example">
        <link rel="icon" href="/icon.png">
      </head></html>`,
      'https://example.com/article',
    );

    expect(metadata).toEqual({
      url: 'https://example.com/article',
      title: 'OG & title',
      description: 'OG description',
      image: 'https://example.com/cover.jpg',
      siteName: 'Example',
      favicon: 'https://example.com/icon.png',
    });
  });

  it('rejects private and credentialed URLs', async () => {
    await expect(
      assertPublicUrl('http://example.test', async () => [{ address: '127.0.0.1', family: 4 }]),
    ).rejects.toThrow('Private network');
    await expect(assertPublicUrl('https://user:pass@example.com', publicLookup)).rejects.toThrow(
      'credentials',
    );
  });

  it('checks redirect targets and parses the final page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location: '/final' } }),
      )
      .mockResolvedValueOnce(
        new Response('<title>Final page</title>', {
          headers: { 'content-type': 'text/html' },
        }),
      );

    const metadata = await resolveLinkMetadata('https://example.com/start', {
      fetch: fetchMock,
      lookup: publicLookup,
    });
    expect(metadata.title).toBe('Final page');
    expect(metadata.url).toBe('https://example.com/final');
  });

  it('keeps stale cache data when refresh fails', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'embeds-test-'));
    const cacheFile = path.join(directory, 'links.json');
    await fs.writeFile(
      cacheFile,
      JSON.stringify({
        'https://example.com': {
          fetchedAt: 0,
          metadata: { url: 'https://example.com', title: 'Cached title' },
        },
      }),
    );

    const cache = await resolveLinksWithCache(['https://example.com'], cacheFile, 1, {
      fetch: vi.fn().mockRejectedValue(new Error('offline')),
      lookup: publicLookup,
    });
    expect(cache['https://example.com'].metadata.title).toBe('Cached title');
  });
});
