import { fileURLToPath } from 'node:url';

const pluginPath = fileURLToPath(new URL('../..', import.meta.url));

export default {
  title: 'Embeds example',
  url: 'https://example.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
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
