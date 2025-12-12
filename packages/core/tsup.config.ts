import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin/wencode.ts'],
  format: ['cjs'],
  dts: false,
  shims: true,
  clean: true,
  splitting: false,
  outDir: 'dist',
});
