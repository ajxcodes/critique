"use strict";
/**
 * critique - CLI Presentation Layer
 *
 * Dispatches CLI invocations, parses command line flags, formats reports,
 * and handles exit codes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCliArguments = parseCliArguments;
exports.printHelp = printHelp;
exports.runCritiqueCli = runCritiqueCli;
const run_critique_1 = require("../application/run-critique");
const constants_1 = require("../domain/constants");
function parseCliArguments(argv) {
    const args = argv.slice(2);
    let staged = false;
    let baseRef;
    let prNumber;
    let commitRange;
    let json = false;
    let help = false;
    let version = false;
    let strict = false;
    let timeoutMs;
    let standardsPath;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--staged' || arg === '-s') {
            staged = true;
        }
        else if (arg === '--json') {
            json = true;
        }
        else if (arg === '--help' || arg === '-h') {
            help = true;
        }
        else if (arg === '--version' || arg === '-v') {
            version = true;
        }
        else if (arg === '--strict') {
            strict = true;
        }
        else if ((arg === '--base' || arg === '-b') && i + 1 < args.length) {
            baseRef = args[++i];
        }
        else if ((arg === '--pr' || arg === '-p') && i + 1 < args.length) {
            const parsed = parseInt(args[++i], 10);
            if (Number.isSafeInteger(parsed) && parsed > 0) {
                prNumber = parsed;
            }
        }
        else if ((arg === '--commit' || arg === '-c') && i + 1 < args.length) {
            commitRange = args[++i];
        }
        else if (arg === '--standards' && i + 1 < args.length) {
            standardsPath = args[++i];
        }
        else if (arg === '--timeout' && i + 1 < args.length) {
            const parsed = parseInt(args[++i], 10);
            if (Number.isSafeInteger(parsed) && parsed > 0) {
                timeoutMs = parsed;
            }
        }
    }
    return {
        staged,
        baseRef,
        prNumber,
        commitRange,
        json,
        help,
        version,
        strict,
        timeoutMs,
        standardsPath
    };
}
function printHelp() {
    console.log(`
critique - Standalone AI Code Reviewer & PR Quality Gatekeeper v${constants_1.CRITIQUE_VERSION}

Usage:
  critique [options]

Options:
  -s, --staged           Review staged changes only (git diff --cached)
  -b, --base <ref>       Review changes against a base branch/commit (git diff <ref>...HEAD)
  -p, --pr <number>      Review a pull request by number (via 'gh pr diff')
  -c, --commit <range>   Review changes within a git commit range (e.g. HEAD~1..HEAD)
      --standards <path> Custom path to markdown review standards document
      --strict           Exit with code 1 if blocking review issues (critical/error) exist
      --json             Output review results in structured JSON format
      --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -v, --version          Show version number and exit
  -h, --help             Show this help message and exit

Standards File Cascade:
  Critique automatically discovers repository rules in the following order:
  1. .github/critique.md
  2. .critique.md
  3. .github/ai-reviewer-standards.md
  4. AGENTS.md
  5. STANDARDS.md
  6. CONTRIBUTING.md

Environment:
  GEMINI_API_KEY         Google Gemini API Key (resolved from env, ./.env, or ~/.env)
  GITHUB_TOKEN           GitHub Personal Access Token (for Copilot fallback or gh CLI)
`);
}
async function runCritiqueCli(argv = process.argv) {
    const parsedArgs = parseCliArguments(argv);
    if (parsedArgs.help) {
        printHelp();
        return constants_1.EXIT_CODE_SUCCESS;
    }
    if (parsedArgs.version) {
        console.log(`critique v${constants_1.CRITIQUE_VERSION}`);
        return constants_1.EXIT_CODE_SUCCESS;
    }
    try {
        const report = await (0, run_critique_1.runCritiqueEngine)({
            staged: parsedArgs.staged,
            baseRef: parsedArgs.baseRef,
            prNumber: parsedArgs.prNumber,
            timeoutMs: parsedArgs.timeoutMs,
            standardsPath: parsedArgs.standardsPath,
            strict: parsedArgs.strict
        });
        if (parsedArgs.json) {
            console.log(JSON.stringify(report.toJSON(), null, 2));
        }
        else {
            console.log(report.formatMarkdownReport());
        }
        if (parsedArgs.strict && report.hasBlockingIssues()) {
            return constants_1.EXIT_CODE_FAILURE;
        }
        return constants_1.EXIT_CODE_SUCCESS;
    }
    catch (err) {
        console.error('critique error:', err instanceof Error ? err.message : String(err));
        return constants_1.EXIT_CODE_FAILURE;
    }
}
if (require.main === module) {
    runCritiqueCli().then((code) => {
        if (code !== 0) {
            process.exit(code);
        }
    });
}
//# sourceMappingURL=critique-cli.js.map