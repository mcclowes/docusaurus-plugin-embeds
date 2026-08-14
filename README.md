# Docusaurus plugin embeds

![Docusaurus plugin embeds banner](assets/readme-banner.png)

Rich MDX embeds for arbitrary links, GitHub repositories, npm packages, and YouTube videos.

The plugin registers its components globally, so MDX files can use them without an import. The cards follow Docusaurus theme variables and work in light and dark modes.

## Install

```shell
npm install docusaurus-plugin-embeds
```

Add the plugin to `docusaurus.config.js`:

```js
export default {
  plugins: ['docusaurus-plugin-embeds'],
};
```

The components are then available in any MDX document:

```mdx
<GitHubRepoCard repo="facebook/docusaurus" />

<NpmPackageCard package="@docusaurus/core" />

<YouTube id="dQw4w9WgXcQ" title="A useful description of the video" />

<RichLinkCard url="https://docusaurus.io/blog/releases/3.0" />
```

## Components

### `RichLinkCard`

Displays a static preview for an arbitrary HTTP link using Open Graph, Twitter Card, or standard HTML metadata. The plugin finds literal URLs in `RichLinkCard` and `LinkCard` elements, resolves them during the build, and caches the result. Readers don't make metadata requests.

```mdx
<RichLinkCard url="https://example.com/article" />

<RichLinkCard
  url="https://example.com/private-page"
  title="Metadata can be supplied explicitly"
  description="Explicit values override fetched metadata."
  image="https://example.com/cover.jpg"
/>
```

| Prop          | Type                        | Required | Default | Description                                   |
| ------------- | --------------------------- | -------- | ------- | --------------------------------------------- |
| `url`         | `string`                    | Yes      |         | Absolute HTTP or HTTPS destination.           |
| `title`       | `string`                    | No       |         | Overrides the fetched title.                  |
| `description` | `string`                    | No       |         | Overrides the fetched description.            |
| `image`       | `string`                    | No       |         | Overrides the fetched preview image.          |
| `siteName`    | `string`                    | No       |         | Overrides the fetched site name.              |
| `favicon`     | `string`                    | No       |         | Overrides the fetched favicon.                |
| `fallback`    | `link \| compact \| hidden` | No       | `link`  | Rendering used when metadata isn't available. |
| `className`   | `string`                    | No       |         | Additional class for the card.                |
| `style`       | `React.CSSProperties`       | No       |         | Inline styles for layout overrides.           |

`LinkCard` is available as an MDX alias. Explicit React imports use `RichLinkCard`.

### `GitHubRepoCard`

Displays a repository's description, visibility, stars, forks, primary language, license, update date, and topics. Repository data comes from GitHub's public API in the reader's browser.

| Prop        | Type                        | Required | Description                          |
| ----------- | --------------------------- | -------- | ------------------------------------ |
| `repo`      | `string`                    | Yes      | Repository in `owner/name` format.   |
| `className` | `string`                    | No       | Additional class for the card.       |
| `style`     | `React.CSSProperties`       | No       | Inline styles for layout overrides.  |
| `fallback`  | `link \| compact \| hidden` | No       | Rendering used after an API failure. |

### `NpmPackageCard`

Displays the latest version, description, weekly downloads, license, update date, and keywords. Package data comes from the npm registry and downloads APIs in the reader's browser.

| Prop        | Type                        | Required | Description                          |
| ----------- | --------------------------- | -------- | ------------------------------------ |
| `package`   | `string`                    | Yes      | npm package name, including scopes.  |
| `className` | `string`                    | No       | Additional class for the card.       |
| `style`     | `React.CSSProperties`       | No       | Inline styles for layout overrides.  |
| `fallback`  | `link \| compact \| hidden` | No       | Rendering used after an API failure. |

### `YouTube`

Displays a responsive, lazy-loaded video using YouTube's privacy-enhanced embed host.

| Prop          | Type                        | Required | Default                | Description                            |
| ------------- | --------------------------- | -------- | ---------------------- | -------------------------------------- |
| `id`          | `string`                    | Yes      |                        | YouTube video ID.                      |
| `title`       | `string`                    | No       | `YouTube video player` | Accessible iframe title.               |
| `aspectRatio` | CSS `aspect-ratio`          | No       | `16 / 9`               | Video aspect ratio.                    |
| `className`   | `string`                    | No       |                        | Additional class for the container.    |
| `fallback`    | `link \| compact \| hidden` | No       | `link`                 | Rendering used when no ID is supplied. |

## Explicit imports

React code outside MDX can import components directly. Import the stylesheet once near the root of the app:

```tsx
import 'docusaurus-plugin-embeds/styles.css';
import {
  GitHubRepoCard,
  NpmPackageCard,
  RichLinkCard,
  YouTube,
} from 'docusaurus-plugin-embeds/client';
```

## Moving existing components

After installing the plugin in an existing Docusaurus site:

1. Add `docusaurus-plugin-embeds` to the site's `plugins` array.
2. Remove local imports such as `@site/src/components/YouTube` from MDX files.
3. Leave the component markup unchanged.
4. Delete the old local components and the shared `formatNumber` helper once nothing imports them.

## API behavior

GitHub and npm cards fetch public data after hydration. Their initial server-rendered HTML contains a loading state and a working destination link. If an API is unavailable or rate-limited, the card remains a usable link and shows an unavailable state.

The plugin doesn't accept or expose API tokens. Sites that need authenticated requests, fixed build output, or strict content security policies should proxy or prefetch this data themselves.

## Rich-link build behavior

By default, the plugin scans `docs`, `blog`, and `src/pages` for literal `url` props. Expressions such as `url={article.url}` can't be discovered, so supply metadata explicitly when using them.

Metadata is cached under `node_modules/.cache/docusaurus-plugin-embeds` for 24 hours. Stale data remains available when a refresh fails. Configure the scan and cache when registering the plugin:

```js
export default {
  plugins: [
    [
      'docusaurus-plugin-embeds',
      {
        include: ['docs', 'src/pages'],
        cacheDir: '.cache/embeds',
        cacheTime: 7 * 24 * 60 * 60 * 1000,
      },
    ],
  ],
};
```

The resolver accepts only HTTP and HTTPS, rejects credentials and private network destinations, checks every redirect, limits redirects and response size, and times out slow requests. These checks matter because arbitrary build-time fetching can otherwise become an SSRF path.

## Development

```shell
npm test
npm run typecheck
npm run lint
npm run build
npm run build:example
```

Requires Node.js 20 or newer.

## License

MIT
