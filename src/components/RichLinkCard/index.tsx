import type { CSSProperties } from 'react';
import type { LinkMetadata } from '../../server/linkMetadata';
import EmbedFallback, { type EmbedFallbackMode } from '../shared/EmbedFallback';
import styles from './styles.module.css';

export interface RichLinkCardProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  metadata?: LinkMetadata;
  fallback?: EmbedFallbackMode;
  className?: string;
  style?: CSSProperties;
}

export default function RichLinkCard({
  url,
  title,
  description,
  image,
  siteName,
  favicon,
  metadata,
  fallback = 'link',
  className,
  style,
}: RichLinkCardProps) {
  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Preserve the supplied value as the only useful fallback.
  }

  const resolved = {
    title: title ?? metadata?.title,
    description: description ?? metadata?.description,
    image: image ?? metadata?.image,
    siteName: siteName ?? metadata?.siteName,
    favicon: favicon ?? metadata?.favicon,
  };
  const hasMetadata = Object.values(resolved).some(Boolean);

  if (!hasMetadata && fallback !== 'link') {
    return (
      <EmbedFallback className={className} href={url} mode={fallback} style={style}>
        {hostname}
      </EmbedFallback>
    );
  }

  return (
    <a
      className={[styles.card, !resolved.image && styles.cardWithoutImage, className]
        .filter(Boolean)
        .join(' ')}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      <div className={styles.content}>
        <div className={styles.source}>
          {resolved.favicon && <img src={resolved.favicon} alt="" width="18" height="18" />}
          <span>{resolved.siteName ?? hostname}</span>
        </div>
        <div className={styles.title}>{resolved.title ?? hostname}</div>
        {resolved.description && <p className={styles.description}>{resolved.description}</p>}
        <div className={styles.hostname}>{hostname}</div>
      </div>
      {resolved.image && (
        <img className={styles.image} src={resolved.image} alt="" loading="lazy" />
      )}
    </a>
  );
}
