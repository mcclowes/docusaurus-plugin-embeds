import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'client/index': 'src/client/index.ts',
    'theme/MDXComponents/index': 'src/theme/MDXComponents/index.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@theme-original/MDXComponents'],
  loader: { '.module.css': 'local-css' },
  esbuildOptions(options, context) {
    if (context.format === 'cjs') {
      options.define = { ...options.define, 'import.meta.url': 'undefined' };
    }
  },
});
