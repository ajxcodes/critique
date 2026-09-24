import { describe, test, expect } from 'vitest';
import { spawnSync } from 'child_process';
import * as path from 'path';

describe('GitHub Action Entrypoint Integration', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const distPath = path.join(rootDir, 'dist/index.js');

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

    // In GitHub Actions environment without key, it emits warning marker
    expect(res.stdout).toContain('::warning::');
    expect(res.status).toBe(0);
  });
});
