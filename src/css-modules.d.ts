declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@theme-original/MDXComponents' {
  import type { ComponentType } from 'react';

  const components: Record<string, ComponentType<never> | string>;
  export default components;
}
