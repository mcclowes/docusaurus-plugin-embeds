import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GitHubRepoCard from '../src/components/GitHubRepoCard';
import NpmPackageCard from '../src/components/NpmPackageCard';
import YouTube from '../src/components/YouTube';

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
