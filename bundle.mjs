import * as esbuild from 'esbuild';
import * as fs from 'fs';

async function bundle() {
  console.log('Building GitHub Action bundle: dist/index.js...');
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/index.js',
    sourcemap: true,
    minify: false
  });

  console.log('Building CLI bundle: bin/critique.js...');
  await esbuild.build({
    entryPoints: ['src/presentation/critique-cli.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'bin/critique.js',
    banner: {
      js: '#!/usr/bin/env node'
    },
    sourcemap: true,
    minify: false
  });

  if (fs.existsSync('bin/critique.js')) {
    fs.chmodSync('bin/critique.js', 0o755);
  }
  if (fs.existsSync('bin/critique')) {
    fs.chmodSync('bin/critique', 0o755);
  }
  console.log('Bundling complete!');
}

bundle().catch((err) => {
  console.error(err);
  process.exit(1);
});
