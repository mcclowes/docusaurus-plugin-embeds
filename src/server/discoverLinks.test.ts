// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { extractRichLinkUrls } from './discoverLinks';

describe('extractRichLinkUrls', () => {
  it('finds quoted literal URLs in both component names', () => {
    expect(
      extractRichLinkUrls(`
        <RichLinkCard url="https://example.com/one" />
        <LinkCard title="Two" url={'https://example.com/two'} />
      `),
    ).toEqual(['https://example.com/one', 'https://example.com/two']);
  });

  it('ignores expressions that cannot be resolved at build time', () => {
    expect(extractRichLinkUrls('<RichLinkCard url={article.url} />')).toEqual([]);
  });
});
