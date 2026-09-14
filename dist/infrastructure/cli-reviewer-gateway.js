"use strict";
/**
 * critique - CliReviewerGateway (Infrastructure Adapter)
 *
 * Implements AiReviewerPort with a 3-tier resolution hierarchy:
 * 1. Bundled bin/critique.js in repository root.
 * 2. ~/.local/bin/critique (fallback ~/.local/bin/ai-reviewer).
 * 3. System $PATH (critique, fallback ai-reviewer).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliReviewerGateway = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const constants_1 = require("../domain/constants");
const ai_review_report_1 = require("../domain/value-objects/ai-review-report");
const process_command_executor_1 = require("./process-command-executor");
function findInSystemPath(binaryName, envPath) {
    const p = envPath !== undefined ? envPath : process.env.PATH || '';
    const dirs = p.split(path.delimiter).filter(Boolean);
    const extensions = process.platform === 'win32' ? ['.cmd', '.bat', '.exe', '.js', ''] : [''];
    for (const dir of dirs) {
        for (const ext of extensions) {
            const fullPath = path.join(dir, `${binaryName}${ext}`);
            try {
                if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                    return fullPath;
                }
            }
            catch {
                // Continue searching
            }
        }
    }
    return null;
}
class CliReviewerGateway {
    commandExecutor;
    constructor(commandExecutor = new process_command_executor_1.ProcessCommandExecutor()) {
        this.commandExecutor = commandExecutor;
    }
    resolveReviewer(cwd = process.cwd()) {
        // 1. Check bundled in repository root
        const repoRootCandidate = path.resolve(__dirname, '../../', constants_1.PATH_BUNDLED_CRITIQUE_JS);
        if (fs.existsSync(repoRootCandidate)) {
            return {
                source: constants_1.RESOLVER_SOURCE_BUNDLED,
                path: repoRootCandidate,
                isAvailable: true
            };
        }
        const cwdCandidate = path.resolve(cwd, constants_1.PATH_BUNDLED_CRITIQUE_JS);
        if (fs.existsSync(cwdCandidate)) {
            return {
                source: constants_1.RESOLVER_SOURCE_BUNDLED,
                path: cwdCandidate,
                isAvailable: true
            };
        }
        // 2. Check ~/.local/bin/critique (or legacy ai-reviewer)
        const userLocalCandidate = path.join(os.homedir(), constants_1.PATH_USER_LOCAL_CRITIQUE);
        if (fs.existsSync(userLocalCandidate)) {
            return {
                source: constants_1.RESOLVER_SOURCE_USER_LOCAL,
                path: userLocalCandidate,
                isAvailable: true
            };
        }
        const legacyUserLocal = path.join(os.homedir(), constants_1.PATH_USER_LOCAL_LEGACY);
        if (fs.existsSync(legacyUserLocal)) {
            return {
                source: constants_1.RESOLVER_SOURCE_USER_LOCAL,
                path: legacyUserLocal,
                isAvailable: true
            };
        }
        // 3. Check system $PATH for critique or ai-reviewer
        const pathCandidate = findInSystemPath('critique') || findInSystemPath('ai-reviewer');
        if (pathCandidate) {
            return {
                source: constants_1.RESOLVER_SOURCE_SYSTEM_PATH,
                path: pathCandidate,
                isAvailable: true
            };
        }
        return {
            source: constants_1.RESOLVER_SOURCE_NONE,
            path: null,
            isAvailable: false
        };
    }
    async review(options = {}) {
        if (options.bypass) {
            return ai_review_report_1.AiReviewReport.bypassed('Bypassed by option');
        }
        const cwd = options.cwd || process.cwd();
        const resolution = this.resolveReviewer(cwd);
        if (resolution.source === constants_1.RESOLVER_SOURCE_BUNDLED || resolution.source === constants_1.RESOLVER_SOURCE_NONE) {
            // Direct execution via application service
            const { runCritiqueEngine } = await Promise.resolve().then(() => __importStar(require('../application/run-critique')));
            return runCritiqueEngine(options, {
                commandExecutor: this.commandExecutor
            });
        }
        const execPath = resolution.path;
        const flags = ['--json'];
        if (options.staged)
            flags.push('--staged');
        if (options.baseRef)
            flags.push(`--base ${options.baseRef}`);
        if (options.prNumber)
            flags.push(`--pr ${options.prNumber}`);
        const command = execPath.endsWith('.js')
            ? `node "${execPath}" ${flags.join(' ')}`
            : `"${execPath}" ${flags.join(' ')}`;
        try {
            const result = await this.commandExecutor.execute(command, {
                cwd,
                timeoutMs: options.timeoutMs,
                env: options.env
            });
            if (result.stdout.trim()) {
                try {
                    return ai_review_report_1.AiReviewReport.parse(result.stdout);
                }
                catch {
                    // Fallback to internal engine on parse failure
                }
            }
        }
        catch {
            // Fallback to internal engine on command failure
        }
        const { runCritiqueEngine } = await Promise.resolve().then(() => __importStar(require('../application/run-critique')));
        return runCritiqueEngine(options, {
            commandExecutor: this.commandExecutor
        });
    }
}
exports.CliReviewerGateway = CliReviewerGateway;
//# sourceMappingURL=cli-reviewer-gateway.js.map