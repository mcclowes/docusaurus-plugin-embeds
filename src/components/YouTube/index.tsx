import type { CSSProperties } from 'react';
import EmbedFallback, { type EmbedFallbackMode } from '../shared/EmbedFallback';
import ResponsiveIframe from '../shared/ResponsiveIframe';

export interface YouTubeProps {
  id?: string;
  title?: string;
  aspectRatio?: CSSProperties['aspectRatio'];
  className?: string;
  fallback?: EmbedFallbackMode;
}

export default function YouTube({
  id,
  title = 'YouTube video player',
  aspectRatio = '16 / 9',
  className,
  fallback = 'link',
}: YouTubeProps) {
  if (!id) {
    return (
      <EmbedFallback
        className={className}
        mode={fallback}
        style={{
          aspectRatio,
          backgroundColor: '#1a1a1a',
          color: '#888',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        YouTube embed not available
      </EmbedFallback>
    );
  }

  return (
    <ResponsiveIframe
      className={className}
      aspectRatio={aspectRatio}
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
