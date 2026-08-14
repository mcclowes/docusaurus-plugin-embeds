import { useEffect, useState, type CSSProperties } from 'react';
import formatNumber from '../../utils/formatNumber';
import EmbedFallback, { type EmbedFallbackMode } from '../shared/EmbedFallback';
import styles from './styles.module.css';

interface NpmMetadata {
  description?: string;
  keywords?: string[];
  license?: string | string[];
  time?: Record<string, string>;
  versions?: Record<string, { keywords?: string[]; license?: string | string[] }>;
  'dist-tags'?: { latest?: string };
}

export interface NpmPackageCardProps {
  package: string;
  className?: string;
  style?: CSSProperties;
  fallback?: EmbedFallbackMode;
}

export default function NpmPackageCard({
  package: packageName,
  className,
  style,
  fallback = 'link',
}: NpmPackageCardProps) {
  const [data, setData] = useState<NpmMetadata | null>(null);
  const [downloads, setDownloads] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(Boolean(packageName));

  useEffect(() => {
    if (!packageName) return;

    const controller = new AbortController();
    const encodedName = encodeURIComponent(packageName);

    Promise.all([
      fetch(`https://registry.npmjs.org/${encodedName}`, { signal: controller.signal }),
      fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`, {
        signal: controller.signal,
      }),
    ])
      .then(async ([metadataResponse, downloadsResponse]) => {
        if (!metadataResponse.ok)
          throw new Error(`Failed to load package: ${metadataResponse.status}`);
        setData((await metadataResponse.json()) as NpmMetadata);
        if (downloadsResponse.ok) {
          const result = (await downloadsResponse.json()) as { downloads?: number };
          setDownloads(result.downloads ?? null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === 'AbortError'))
          setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [packageName]);

  const latestVersion = data?.['dist-tags']?.latest;
  const latest = latestVersion ? data?.versions?.[latestVersion] : undefined;
  const keywords = latest?.keywords ?? data?.keywords ?? [];
  const license = latest?.license ?? data?.license;
  const published = latestVersion && data?.time?.[latestVersion];
  const href = `https://www.npmjs.com/package/${packageName}`;

  if (error && fallback !== 'link') {
    return (
      <EmbedFallback className={className} href={href} mode={fallback} style={style}>
        npm / {packageName}
      </EmbedFallback>
    );
  }

  return (
    <a
      className={[styles.card, className].filter(Boolean).join(' ')}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      <div className={styles.header}>
        <div className={styles.name}>npm / {packageName}</div>
        <span className={error ? styles.badgeError : styles.badge}>
          {loading
            ? 'Loading…'
            : error
              ? 'Unavailable'
              : latestVersion
                ? `v${latestVersion}`
                : 'npm'}
        </span>
      </div>
      <p className={styles.description}>
        {loading ? 'Fetching package details…' : data?.description || 'No description provided.'}
      </p>
      <div className={styles.metaRow}>
        {downloads !== null && (
          <span title="Downloads last week">↓ {formatNumber(downloads)}/wk</span>
        )}
        {license && (
          <span title="License">{Array.isArray(license) ? license.join(', ') : license}</span>
        )}
        {published && (
          <span title="Last updated">Updated {new Date(published).toLocaleDateString()}</span>
        )}
      </div>
      {keywords.length > 0 && (
        <div className={styles.topics}>
          {keywords.slice(0, 6).map((keyword) => (
            <span key={keyword} className={styles.topic}>
              {keyword}
            </span>
          ))}
        </div>
      )}
      <svg className={styles.logo} viewBox="0 0 27.23 27.23" aria-hidden="true">
        <rect width="27.23" height="27.23" rx="2" fill="#CB3837" />
        <polygon
          fill="#fff"
          points="5.8 21.75 13.66 21.75 13.67 9.98 17.59 9.98 17.58 21.76 21.51 21.76 21.52 6.06 5.82 6.04 5.8 21.75"
        />
      </svg>
    </a>
  );
}
