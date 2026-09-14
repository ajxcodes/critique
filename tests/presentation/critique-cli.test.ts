import { describe, test, expect } from 'vitest';
import {
  parseCliArguments,
  printHelp
} from '../../src/presentation/critique-cli';

describe('Critique CLI Argument Parsing', () => {
  test('parses default empty arguments', () => {
    const parsed = parseCliArguments(['node', 'critique']);
    expect(parsed.staged).toBe(false);
    expect(parsed.baseRef).toBeUndefined();
    expect(parsed.prNumber).toBeUndefined();
    expect(parsed.json).toBe(false);
    expect(parsed.strict).toBe(false);
    expect(parsed.help).toBe(false);
    expect(parsed.version).toBe(false);
  });

  test('parses --staged and -s flags', () => {
    const parsedLong = parseCliArguments(['node', 'critique', '--staged']);
    expect(parsedLong.staged).toBe(true);

    const parsedShort = parseCliArguments(['node', 'critique', '-s']);
    expect(parsedShort.staged).toBe(true);
  });

  test('parses --base and -b flags', () => {
    const parsedLong = parseCliArguments(['node', 'critique', '--base', 'origin/main']);
    expect(parsedLong.baseRef).toBe('origin/main');

    const parsedShort = parseCliArguments(['node', 'critique', '-b', 'HEAD~1']);
    expect(parsedShort.baseRef).toBe('HEAD~1');
  });

  test('parses --pr and -p flags', () => {
    const parsedLong = parseCliArguments(['node', 'critique', '--pr', '74']);
    expect(parsedLong.prNumber).toBe(74);

    const parsedShort = parseCliArguments(['node', 'critique', '-p', '100']);
    expect(parsedShort.prNumber).toBe(100);
  });

  test('parses --commit, --standards, --strict, --timeout, and --json flags', () => {
    const parsed = parseCliArguments([
      'node',
      'critique',
      '--commit',
      'abc..def',
      '--standards',
      'custom.md',
      '--strict',
      '--timeout',
      '45000',
      '--json'
    ]);

    expect(parsed.commitRange).toBe('abc..def');
    expect(parsed.standardsPath).toBe('custom.md');
    expect(parsed.strict).toBe(true);
    expect(parsed.timeoutMs).toBe(45000);
    expect(parsed.json).toBe(true);
  });

  test('parses --version and -v flags', () => {
    const parsedLong = parseCliArguments(['node', 'critique', '--version']);
    expect(parsedLong.version).toBe(true);

    const parsedShort = parseCliArguments(['node', 'critique', '-v']);
    expect(parsedShort.version).toBe(true);
  });

  test('parses --help and -h flags', () => {
    const parsedLong = parseCliArguments(['node', 'critique', '--help']);
    expect(parsedLong.help).toBe(true);

    const parsedShort = parseCliArguments(['node', 'critique', '-h']);
    expect(parsedShort.help).toBe(true);
  });

  test('printHelp executes without throwing', () => {
    expect(() => printHelp()).not.toThrow();
  });
});
