import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin/zhcode.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  shims: true,
  clean: true,
  splitting: false,
  outDir: 'dist',
});
