import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from '@docusaurus/types';

export default function embedsPlugin(): Plugin {
  const moduleDirectory =
    typeof __dirname === 'string' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

  return {
    name: 'docusaurus-plugin-embeds',
    getThemePath() {
      return path.join(moduleDirectory, 'theme');
    },
    getClientModules() {
      return [path.join(moduleDirectory, 'theme/MDXComponents/index.css')];
    },
  };
}
