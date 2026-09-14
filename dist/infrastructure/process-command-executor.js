"use strict";
/**
 * critique - ProcessCommandExecutor Infrastructure Adapter
 *
 * Implements CommandExecutorPort using isolated child processes (child_process.spawn)
 * with timeout enforcement and stdout/stderr stream buffering.
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
exports.ProcessCommandExecutor = void 0;
const child_process = __importStar(require("child_process"));
class ProcessCommandExecutor {
    async execute(command, options = {}) {
        const cwd = options.cwd || process.cwd();
        const timeoutMs = options.timeoutMs && options.timeoutMs > 0 ? options.timeoutMs : undefined;
        const env = options.env ? { ...process.env, ...options.env } : process.env;
        return new Promise((resolve) => {
            let stdoutBuffer = '';
            let stderrBuffer = '';
            let timedOut = false;
            let timer = null;
            const proc = child_process.spawn(command, {
                shell: true,
                cwd,
                env,
                detached: process.platform !== 'win32'
            });
            if (timeoutMs) {
                timer = setTimeout(() => {
                    timedOut = true;
                    try {
                        if (proc.pid && process.platform !== 'win32') {
                            process.kill(-proc.pid, 'SIGTERM');
                        }
                        else {
                            proc.kill('SIGTERM');
                        }
                    }
                    catch {
                        // Process may have already exited
                    }
                    const killTimer = setTimeout(() => {
                        try {
                            if (proc.pid && process.platform !== 'win32') {
                                process.kill(-proc.pid, 'SIGKILL');
                            }
                            else {
                                proc.kill('SIGKILL');
                            }
                        }
                        catch {
                            // Ignore kill errors
                        }
                    }, 500);
                    killTimer.unref();
                }, timeoutMs);
            }
            proc.stdout?.on('data', (chunk) => {
                stdoutBuffer += chunk.toString();
            });
            proc.stderr?.on('data', (chunk) => {
                stderrBuffer += chunk.toString();
            });
            proc.on('error', (err) => {
                if (timer)
                    clearTimeout(timer);
                stderrBuffer += `\nProcess execution error: ${err.message}`;
                resolve({
                    exitCode: 1,
                    stdout: stdoutBuffer,
                    stderr: stderrBuffer
                });
            });
            proc.on('close', (code) => {
                if (timer)
                    clearTimeout(timer);
                let exitCode = code !== null ? code : 1;
                if (timedOut) {
                    exitCode = exitCode !== 0 ? exitCode : 1;
                }
                resolve({
                    exitCode,
                    stdout: stdoutBuffer,
                    stderr: stderrBuffer
                });
            });
        });
    }
}
exports.ProcessCommandExecutor = ProcessCommandExecutor;
//# sourceMappingURL=process-command-executor.js.map