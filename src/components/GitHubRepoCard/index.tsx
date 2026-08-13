import { useEffect, useState, type CSSProperties } from 'react';
import formatNumber from '../../utils/formatNumber';
import styles from './styles.module.css';

interface GitHubRepository {
  description?: string | null;
  forks_count?: number;
  html_url?: string;
  language?: string | null;
  license?: { spdx_id?: string | null } | null;
  stargazers_count?: number;
  topics?: string[];
  updated_at?: string;
  visibility?: string;
}

export interface GitHubRepoCardProps {
  repo: string;
  className?: string;
  style?: CSSProperties;
}

export default function GitHubRepoCard({ repo, className, style }: GitHubRepoCardProps) {
  const [data, setData] = useState<GitHubRepository | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(Boolean(repo));

  useEffect(() => {
    if (!repo) return;

    const controller = new AbortController();

    fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load repository: ${response.status}`);
        return response.json() as Promise<GitHubRepository>;
      })
      .then(setData)
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === 'AbortError'))
          setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [repo]);

  const license = data?.license?.spdx_id;

  return (
    <a
      className={[styles.card, className].filter(Boolean).join(' ')}
      href={data?.html_url ?? `https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      <div className={styles.header}>
        <div className={styles.name}>GitHub / {repo}</div>
        <span className={error ? styles.badgeError : styles.badge}>
          {loading
            ? 'Loading…'
            : error
              ? 'Unavailable'
              : data?.visibility === 'private'
                ? 'Private'
                : 'Public'}
        </span>
      </div>
      <p className={styles.description}>
        {loading ? 'Fetching repository details…' : data?.description || 'No description provided.'}
      </p>
      <div className={styles.metaRow}>
        <span title="Stars">★ {formatNumber(data?.stargazers_count)}</span>
        <span title="Forks">⑂ {formatNumber(data?.forks_count)}</span>
        {data?.language && <span title="Primary language">{data.language}</span>}
        {license && license !== 'NOASSERTION' && <span title="License">{license}</span>}
        {data?.updated_at && (
          <span title="Last updated">Updated {new Date(data.updated_at).toLocaleDateString()}</span>
        )}
      </div>
      {data?.topics?.length ? (
        <div className={styles.topics}>
          {data.topics.slice(0, 6).map((topic) => (
            <span key={topic} className={styles.topic}>
              {topic}
            </span>
          ))}
        </div>
      ) : null}
      <svg className={styles.logo} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
        />
      </svg>
    </a>
  );
}
