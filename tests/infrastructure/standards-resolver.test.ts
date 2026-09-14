import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { StandardsResolver } from '../../src/infrastructure/standards-resolver';

describe('StandardsResolver 6-tier Cascade', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'critique-standards-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('prioritizes .github/critique.md over all other files', () => {
    fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.github/critique.md'), 'Content from .github/critique.md');
    fs.writeFileSync(path.join(tmpDir, '.critique.md'), 'Content from .critique.md');
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), 'Content from AGENTS.md');

    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir);
    expect(result.path).toBe(path.join(tmpDir, '.github/critique.md'));
    expect(result.content).toBe('Content from .github/critique.md');
  });

  test('falls back to .critique.md when .github/critique.md is absent', () => {
    fs.writeFileSync(path.join(tmpDir, '.critique.md'), 'Content from .critique.md');
    fs.writeFileSync(path.join(tmpDir, 'STANDARDS.md'), 'Content from STANDARDS.md');

    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir);
    expect(result.path).toBe(path.join(tmpDir, '.critique.md'));
    expect(result.content).toBe('Content from .critique.md');
  });

  test('falls back to legacy .github/ai-reviewer-standards.md', () => {
    fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.github/ai-reviewer-standards.md'), 'Legacy standards content');
    fs.writeFileSync(path.join(tmpDir, 'CONTRIBUTING.md'), 'Contributing content');

    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir);
    expect(result.path).toBe(path.join(tmpDir, '.github/ai-reviewer-standards.md'));
    expect(result.content).toBe('Legacy standards content');
  });

  test('falls back through AGENTS.md, STANDARDS.md, and CONTRIBUTING.md', () => {
    fs.writeFileSync(path.join(tmpDir, 'CONTRIBUTING.md'), 'Contributing guidelines');

    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir);
    expect(result.path).toBe(path.join(tmpDir, 'CONTRIBUTING.md'));
    expect(result.content).toBe('Contributing guidelines');
  });

  test('returns null when no candidate file exists', () => {
    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir);
    expect(result.path).toBeNull();
    expect(result.content).toBeNull();
  });

  test('respects custom standardsPath option', () => {
    const customFile = path.join(tmpDir, 'custom-rules.md');
    fs.writeFileSync(customFile, 'Custom rule content');

    const resolver = new StandardsResolver();
    const result = resolver.resolve(tmpDir, customFile);
    expect(result.path).toBe(customFile);
    expect(result.content).toBe('Custom rule content');
  });
});
