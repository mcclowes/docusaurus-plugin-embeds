import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
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
});
