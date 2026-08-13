import type { CSSProperties } from 'react';

export interface YouTubeProps {
  id?: string;
  title?: string;
  aspectRatio?: CSSProperties['aspectRatio'];
  className?: string;
}

export default function YouTube({
  id,
  title = 'YouTube video player',
  aspectRatio = '16 / 9',
  className,
}: YouTubeProps) {
  if (!id) {
    return (
      <div
        className={className}
        role="status"
        style={{
          alignItems: 'center',
          aspectRatio,
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          color: '#888',
          display: 'flex',
          justifyContent: 'center',
          maxWidth: '100%',
          padding: '2rem',
          width: '100%',
        }}
      >
        YouTube embed not available
      </div>
    );
  }

  return (
    <iframe
      className={className}
      style={{ aspectRatio, border: 0, maxWidth: '100%', width: '100%' }}
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
