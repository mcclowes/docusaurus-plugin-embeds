import type { CSSProperties, IframeHTMLAttributes } from 'react';

export interface ResponsiveIframeProps extends Omit<
  IframeHTMLAttributes<HTMLIFrameElement>,
  'style'
> {
  aspectRatio?: CSSProperties['aspectRatio'];
  style?: CSSProperties;
}

export default function ResponsiveIframe({
  aspectRatio = '16 / 9',
  loading = 'lazy',
  referrerPolicy = 'strict-origin-when-cross-origin',
  style,
  ...props
}: ResponsiveIframeProps) {
  return (
    <iframe
      {...props}
      loading={loading}
      referrerPolicy={referrerPolicy}
      style={{ aspectRatio, border: 0, maxWidth: '100%', width: '100%', ...style }}
    />
  );
}
