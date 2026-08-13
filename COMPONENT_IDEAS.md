# Component ideas

The best additions turn a plain third-party link into useful context, degrade to a link, and don't make every page carry a large vendor script.

## Build next

### Generic link preview

A compact Open Graph card would cover articles, product pages, and sites without a dedicated component. It should resolve metadata at build time through a cache, since browser fetches will hit CORS restrictions. This also gives static HTML, predictable builds, and no reader-side requests.

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

Before adding more API-backed cards, add a build-time metadata cache with stale-while-revalidate behavior. Before adding more iframe providers, extract a private responsive iframe component that owns aspect ratio, lazy loading, titles, referrer policy, and fallback UI. Both are real abstractions with clear interfaces; a generic card component would be premature until two or three more cards expose the common shape.
