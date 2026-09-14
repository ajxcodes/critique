"use strict";
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
exports.StandardsResolver = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("../domain/constants");
class StandardsResolver {
    resolve(cwd = process.cwd(), customPath) {
        if (customPath) {
            const explicitPath = path.isAbsolute(customPath) ? customPath : path.resolve(cwd, customPath);
            if (fs.existsSync(explicitPath)) {
                try {
                    const content = fs.readFileSync(explicitPath, 'utf8');
                    return { path: explicitPath, content: content.trim() };
                }
                catch {
                    return { path: null, content: null };
                }
            }
        }
        for (const candidate of constants_1.STANDARD_CANDIDATE_PATHS) {
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
                }
                catch {
                    // Continue to next candidate
                }
            }
        }
        return { path: null, content: null };
    }
}
exports.StandardsResolver = StandardsResolver;
//# sourceMappingURL=standards-resolver.js.map