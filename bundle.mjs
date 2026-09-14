import * as esbuild from 'esbuild';
import * as fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = pkg.version;
const versionDefine = { __CRITIQUE_VERSION__: JSON.stringify(version) };

async function bundle() {
  console.log(`Building GitHub Action bundle: dist/index.js... (v${version})`);
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/index.js',
    sourcemap: true,
    minify: false,
    define: versionDefine,
  });

  console.log(`Building CLI bundle: bin/critique.js... (v${version})`);
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
    minify: false,
    define: versionDefine,
  });

  if (fs.existsSync('bin/critique.js')) {
    fs.chmodSync('bin/critique.js', 0o755);
  }
  if (fs.existsSync('bin/critique')) {
    fs.chmodSync('bin/critique', 0o755);
  }

  // Sync plugin.json version to match package.json
  if (fs.existsSync('plugin.json')) {
    const plugin = JSON.parse(fs.readFileSync('plugin.json', 'utf-8'));
    if (plugin.version !== version) {
      plugin.version = version;
      fs.writeFileSync('plugin.json', JSON.stringify(plugin, null, 2) + '\n');
      console.log(`Synced plugin.json version to ${version}`);
    }
  }

  console.log('Bundling complete!');
}

bundle().catch((err) => {
  console.error(err);
  process.exit(1);
});

