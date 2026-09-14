/**
 * critique - Main Entry Point & Root Library Export
 */

export * from './domain';
export * from './ports';
export * from './infrastructure';
export * from './application';
export * from './presentation';

import { runGitHubAction } from './presentation/action-runner';

// If executed directly inside GitHub Actions runner, trigger action runner
if (process.env.GITHUB_ACTIONS === 'true' && require.main === module) {
  runGitHubAction().catch((err) => {
    console.error('Unhandled action error:', err);
    process.exit(1);
  });
}
