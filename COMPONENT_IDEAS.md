# Component ideas

The best additions turn a plain third-party link into useful context, degrade to a link, and don't make every page carry a large vendor script.

## Built

- Generic link previews with build-time Open Graph metadata, caching, stale fallback, explicit overrides, and compact or hidden fallbacks.
- A private responsive iframe primitive used by YouTube and ready for other providers.

## Build next

### GitHub issue and pull request

These can reuse the GitHub visual language while showing state, title, labels, author, and comment count. They solve a different reading task from repository cards and are common in engineering documentation.

### Code playground

One component with a `provider` prop could cover CodePen, CodeSandbox, StackBlitz, and Observable. These providers share an iframe-shaped interface, so one abstraction is clearer than four nearly identical exports.

### Vimeo

This is the simplest extension of the video component. A shared responsive iframe primitive could support YouTube and Vimeo without leaking provider details into their public props.

## Good follow-ups

- Figma files and prototypes, with an explicit title and optional starting node.
- Spotify tracks, albums, playlists, and podcast episodes.
- Bluesky and Mastodon posts, preferably rendered from fetched data instead of vendor scripts.
- GitHub gists, with a static fallback for blocked scripts.
- npm package install snippets, including npm, pnpm, Yarn, and Bun tabs.
- Package cards for PyPI, crates.io, RubyGems, and Packagist.
- Speaker Deck or SlideShare presentations.
- Loom videos for internal and product documentation.

## Hold off

- X posts: the embed depends on a heavy vendor script and the unauthenticated API is awkward.
- Arbitrary iframes: easy to add, but hard to make safe, accessible, and compatible with content security policies.
- Social follow buttons and counters: they age badly, add tracking, and don't add much context to a document.
- Live GitHub or npm data during the Docusaurus build: it makes builds depend on third-party uptime unless caching and stale data behavior are designed first.

## Shared work before the list grows

The build-time metadata cache and responsive iframe primitive now exist. Reuse them for API-backed cards and iframe providers, but wait for two or three cards to expose a stable common shape before extracting a generic card component.
