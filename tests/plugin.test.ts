import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import embedsPlugin from '../src';

describe('embedsPlugin', () => {
  it('registers its MDX component theme and styles', () => {
    const plugin = embedsPlugin();
    const themePath = plugin.getThemePath?.();
    const clientModules = plugin.getClientModules?.();

    expect(themePath).toContain(path.join('src', 'theme'));
    expect(fs.existsSync(path.join(String(themePath), 'MDXComponents', 'index.tsx'))).toBe(true);
    expect(clientModules).toEqual([path.join(String(themePath), 'MDXComponents', 'index.css')]);
  });

  it('publishes discovered link metadata as global data', async () => {
    const siteDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'embeds-site-'));
    await fsPromises.mkdir(path.join(siteDir, 'docs'));
    await fsPromises.writeFile(
      path.join(siteDir, 'docs', 'index.mdx'),
      '<RichLinkCard url="https://example.com" />',
    );

    const plugin = embedsPlugin({ siteDir } as Parameters<typeof embedsPlugin>[0], {
      cacheDir: '.cache',
      cacheTime: Number.POSITIVE_INFINITY,
    });
    await fsPromises.mkdir(path.join(siteDir, '.cache'));
    await fsPromises.writeFile(
      path.join(siteDir, '.cache', 'links.json'),
      JSON.stringify({
        'https://example.com': {
          fetchedAt: Date.now(),
          metadata: { url: 'https://example.com', title: 'Cached example' },
        },
      }),
    );

    const content = await plugin.loadContent?.();
    const setGlobalData = vi.fn();
    await plugin.contentLoaded?.({
      content: content!,
      actions: { setGlobalData } as never,
    });

    expect(setGlobalData).toHaveBeenCalledWith({
      links: {
        'https://example.com': { url: 'https://example.com', title: 'Cached example' },
      },
    });
  });
});
