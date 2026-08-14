import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { discoverRichLinkUrls } from './server/discoverLinks';
import { resolveLinksWithCache, type LinkMetadata } from './server/linkMetadata';

export interface EmbedsPluginOptions {
  cacheDir?: string;
  cacheTime?: number;
  include?: string[];
}

interface EmbedsContent {
  links: Record<string, LinkMetadata>;
}

export default function embedsPlugin(
  context?: LoadContext,
  options: EmbedsPluginOptions = {},
): Plugin<EmbedsContent> {
  const moduleDirectory =
    typeof __dirname === 'string' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  const siteDir = context?.siteDir;

  return {
    name: 'docusaurus-plugin-embeds',
    async loadContent() {
      if (!siteDir) return { links: {} };
      const urls = await discoverRichLinkUrls(
        siteDir,
        options.include ?? ['docs', 'blog', 'src/pages'],
      );
      const cacheFile = path.join(
        options.cacheDir
          ? path.resolve(siteDir, options.cacheDir)
          : path.join(siteDir, 'node_modules/.cache/docusaurus-plugin-embeds'),
        'links.json',
      );
      const cache = await resolveLinksWithCache(
        urls,
        cacheFile,
        options.cacheTime ?? 24 * 60 * 60 * 1_000,
      );
      return {
        links: Object.fromEntries(
          Object.entries(cache).map(([url, entry]) => [url, entry.metadata]),
        ),
      };
    },
    contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
    getThemePath() {
      return path.join(moduleDirectory, 'theme');
    },
    getClientModules() {
      return [path.join(moduleDirectory, 'theme/MDXComponents/index.css')];
    },
  };
}
