# Docusaurus plugin embeds

Rich MDX embeds for GitHub repositories, npm packages, and YouTube videos.

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
```

## Components

### `GitHubRepoCard`

Displays a repository's description, visibility, stars, forks, primary language, license, update date, and topics. Repository data comes from GitHub's public API in the reader's browser.

| Prop        | Type                  | Required | Description                         |
| ----------- | --------------------- | -------- | ----------------------------------- |
| `repo`      | `string`              | Yes      | Repository in `owner/name` format.  |
| `className` | `string`              | No       | Additional class for the card.      |
| `style`     | `React.CSSProperties` | No       | Inline styles for layout overrides. |

### `NpmPackageCard`

Displays the latest version, description, weekly downloads, license, update date, and keywords. Package data comes from the npm registry and downloads APIs in the reader's browser.

| Prop        | Type                  | Required | Description                         |
| ----------- | --------------------- | -------- | ----------------------------------- |
| `package`   | `string`              | Yes      | npm package name, including scopes. |
| `className` | `string`              | No       | Additional class for the card.      |
| `style`     | `React.CSSProperties` | No       | Inline styles for layout overrides. |

### `YouTube`

Displays a responsive, lazy-loaded video using YouTube's privacy-enhanced embed host.

| Prop          | Type               | Required | Default                | Description                         |
| ------------- | ------------------ | -------- | ---------------------- | ----------------------------------- |
| `id`          | `string`           | Yes      |                        | YouTube video ID.                   |
| `title`       | `string`           | No       | `YouTube video player` | Accessible iframe title.            |
| `aspectRatio` | CSS `aspect-ratio` | No       | `16 / 9`               | Video aspect ratio.                 |
| `className`   | `string`           | No       |                        | Additional class for the container. |

## Explicit imports

React code outside MDX can import components directly. Import the stylesheet once near the root of the app:

```tsx
import 'docusaurus-plugin-embeds/styles.css';
import { GitHubRepoCard, NpmPackageCard, YouTube } from 'docusaurus-plugin-embeds/client';
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

## Development

```shell
npm test
npm run typecheck
npm run lint
npm run build
```

Requires Node.js 20 or newer.

## License

MIT
