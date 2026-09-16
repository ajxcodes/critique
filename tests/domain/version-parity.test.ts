import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CRITIQUE_VERSION } from '../../src/domain/constants';

describe('Version Parity & Drift Prevention', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const pluginJsonPath = path.join(rootDir, 'plugin.json');
  const readmePath = path.join(rootDir, 'README.md');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  test('package.json defines a valid SemVer version', () => {
    expect(packageJson.version).toBeDefined();
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/);
  });

  test('plugin.json version matches package.json version exactly', () => {
    expect(pluginJson.version).toBe(packageJson.version);
  });

  test('CRITIQUE_VERSION constant matches package.json version exactly', () => {
    expect(CRITIQUE_VERSION).toBe(packageJson.version);
  });

  test('README.md action reference matches package.json version', () => {
    const expectedActionRef = `ajxcodes/critique@v${packageJson.version}`;
    expect(readmeContent).toContain(expectedActionRef);
  });
});
