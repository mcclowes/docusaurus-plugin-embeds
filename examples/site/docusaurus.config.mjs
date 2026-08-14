import { fileURLToPath } from 'node:url';

const pluginPath = fileURLToPath(new URL('../..', import.meta.url));

export default {
  title: 'Embeds example',
  url: 'https://example.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  // Docusaurus 3.10 reports same-page anchors on a root-mounted docs route as broken.
  onBrokenAnchors: 'ignore',
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: false,
        },
        blog: false,
      },
    ],
  ],
  plugins: [
    [
      pluginPath,
      {
        include: ['docs'],
        cacheDir: 'metadata-cache',
      },
    ],
  ],
};
