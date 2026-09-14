/**
 * critique - StandardsResolver (Infrastructure Layer)
 *
 * Implements the 6-tier discovery cascade for project review standards:
 * 1. .github/critique.md
 * 2. .critique.md
 * 3. .github/ai-reviewer-standards.md (legacy fallback)
 * 4. AGENTS.md
 * 5. STANDARDS.md
 * 6. CONTRIBUTING.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { STANDARD_CANDIDATE_PATHS } from '../domain/constants';

export interface StandardsDiscoveryResult {
  readonly path: string | null;
  readonly content: string | null;
}

export class StandardsResolver {
  public resolve(cwd: string = process.cwd(), customPath?: string | null): StandardsDiscoveryResult {
    if (customPath) {
      const explicitPath = path.isAbsolute(customPath) ? customPath : path.resolve(cwd, customPath);
      if (fs.existsSync(explicitPath)) {
        try {
          const content = fs.readFileSync(explicitPath, 'utf8');
          return { path: explicitPath, content: content.trim() };
        } catch {
          return { path: null, content: null };
        }
      }
    }

    for (const candidate of STANDARD_CANDIDATE_PATHS) {
      const candidatePath = path.resolve(cwd, candidate);
      if (fs.existsSync(candidatePath)) {
        try {
          const stat = fs.statSync(candidatePath);
          if (stat.isFile()) {
            const content = fs.readFileSync(candidatePath, 'utf8');
            return {
              path: candidatePath,
              content: content.trim()
            };
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    return { path: null, content: null };
  }
}
