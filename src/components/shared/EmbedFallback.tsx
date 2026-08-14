import type { CSSProperties, ReactNode } from 'react';

export type EmbedFallbackMode = 'link' | 'compact' | 'hidden';

export interface EmbedFallbackProps {
  children: ReactNode;
  className?: string;
  href?: string;
  mode?: EmbedFallbackMode;
  style?: CSSProperties;
}

export default function EmbedFallback({
  children,
  className,
  href,
  mode = 'link',
  style,
}: EmbedFallbackProps) {
  if (mode === 'hidden') return null;

  const content = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    children
  );

  if (mode === 'compact') {
    return (
      <span className={className} role="status" style={style}>
        {content}
      </span>
    );
  }

  return (
    <div
      className={className}
      role="status"
      style={{
        alignItems: 'center',
        border: '1px solid var(--ifm-color-emphasis-300, #d0d7de)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '5rem',
        padding: '1rem',
        ...style,
      }}
    >
      {content}
    </div>
  );
}
