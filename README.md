# critique

> Standalone AI Code Reviewer & PR Quality Gatekeeper for local CLI and GitHub Actions.

[![Release](https://img.shields.io/github/v/release/ajxcodes/critique?style=flat-square)](https://github.com/ajxcodes/critique/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Critique** provides automated, intelligent code reviews powered by Google Gemini (with seamless model fallback cascades: `gemini-3.5-flash-lite` ➔ `gemini-3.5-flash` ➔ `gemini-2.5-flash` ➔ `gemini-2.5-pro` ➔ Copilot `gpt-4o`). It operates as both a local CLI tool (`critique`) and a zero-dependency native GitHub Action.

---

## Features

- 🧠 **Dual Packaging**: Run locally via the `critique` CLI or in CI/CD via `action.yml`.
- 🔄 **Autonomous Model Fallback**: Gracefully cascades through Gemini models on 503/429 errors, with secondary fallback to GitHub Models API (`gpt-4o`).
- 📋 **Standards Cascade Discovery**: Discovers project rules in deterministic priority order:
  1. `.github/critique.md`
  2. `.critique.md`
  3. `.github/ai-reviewer-standards.md` (legacy fallback)
  4. `AGENTS.md`
  5. `STANDARDS.md`
  6. `CONTRIBUTING.md`
- 💬 **GitHub PR Integration**:
  - Automatically queries existing PR review threads via GraphQL.
  - Automatically resolves threads when the latest diff addresses previous feedback.
  - Posts inline code review comments with severity badges (`🔴 CRITICAL`, `⚠️ WARNING`, `ℹ️ INFO`).
  - Updates the PR description with an AI-generated summary and changelog.
  - Posts a comprehensive run summary comment.
- ⚡ **Zero Runtime Dependencies in CI**: Self-contained bundle compiled with `esbuild`.

---

## Installation & Local CLI Usage

### Local Installation
```bash
# Symlink or copy bin/critique to your PATH:
ln -sf /path/to/critique/bin/critique ~/.local/bin/critique
```

### Running Locally
```bash
# Review unstaged + staged working tree changes
critique

# Review staged changes only
critique --staged

# Review changes against a base branch/commit
critique --base origin/main

# Review a pull request by number via GitHub CLI
critique --pr 42

# Output structured JSON
critique --json

# Fail with exit code 1 if blocking issues are found
critique --strict
```

### Environment Configuration
Critique reads `GEMINI_API_KEY` from:
1. Shell environment variables (`export GEMINI_API_KEY="..."`)
2. Local repository `.env`
3. Home directory `~/.env`

---

## GitHub Actions Usage

Add Critique to your `.github/workflows/critique.yml`:

```yaml
name: Critique AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  pull-requests: write
  issues: write
  contents: write # Needed for GraphQL thread resolution

jobs:
  review:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Critique Reviewer
        uses: ajxcodes/critique@v0.1.0
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          strict: false
```

---

## License

MIT © [Alvin Jorrel Pascual](https://github.com/ajxcodes)
