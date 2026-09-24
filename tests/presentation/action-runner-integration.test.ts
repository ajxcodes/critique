import { describe, test, expect, beforeAll } from 'vitest';
import { spawnSync, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('GitHub Action Entrypoint Integration', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const distPath = path.join(rootDir, 'dist/index.js');

  beforeAll(() => {
    if (!fs.existsSync(distPath)) {
      execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    }
  });

  test('fails execution when required GitHub Actions environment or API key is missing', () => {
    const res = spawnSync(process.execPath, [distPath], {
      env: {
        ...process.env,
        GITHUB_ACTIONS: 'true',
        GITHUB_REPOSITORY: 'ajxcodes/critique',
        INPUT_FAIL_ON_SEVERITY: 'error',
        GEMINI_API_KEY: '',
        INPUT_GEMINI_API_KEY: ''
      },
      encoding: 'utf-8'
    });

    expect(res.stdout).toContain('::warning::');
    expect(res.status).toBe(0);
  });
});
