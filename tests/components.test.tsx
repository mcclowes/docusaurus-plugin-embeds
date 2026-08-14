import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GitHubRepoCard from '../src/components/GitHubRepoCard';
import NpmPackageCard from '../src/components/NpmPackageCard';
import YouTube from '../src/components/YouTube';
import RichLinkCard from '../src/components/RichLinkCard';

describe('YouTube', () => {
  it('uses the privacy-enhanced embed host', () => {
    render(<YouTube id="abc123" title="Demo" />);
    expect(screen.getByTitle('Demo')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123',
    );
  });

  it('renders a fallback without an id', () => {
    render(<YouTube />);
    expect(screen.getByRole('status')).toHaveTextContent('YouTube embed not available');
  });

  it('can hide an unavailable embed', () => {
    const { container } = render(<YouTube fallback="hidden" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('GitHubRepoCard', () => {
  it('renders a safe repository link while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
    render(<GitHubRepoCard repo="mcclowes/example" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/mcclowes/example');
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('NpmPackageCard', () => {
  it('renders a safe package link while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
    render(<NpmPackageCard package="example-package" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/example-package',
    );
    expect(screen.getByRole('link')).toHaveTextContent('Fetching package details');
  });
});

describe('RichLinkCard', () => {
  it('renders resolved metadata and a safe destination link', () => {
    const { container } = render(
      <RichLinkCard
        url="https://example.com/article"
        metadata={{
          url: 'https://example.com/article',
          title: 'Example article',
          description: 'A useful summary.',
          image: 'https://example.com/image.jpg',
          siteName: 'Example',
        }}
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/article');
    expect(screen.getByText('Example article')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('supports compact and hidden fallbacks without metadata', () => {
    const { rerender, container } = render(
      <RichLinkCard url="https://example.com/article" fallback="compact" />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('example.com');
    rerender(<RichLinkCard url="https://example.com/article" fallback="hidden" />);
    expect(container).toBeEmptyDOMElement();
  });
});
