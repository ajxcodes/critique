# critique

> Standalone AI Code Reviewer & PR Quality Gatekeeper for CLI, CI/CD, and Antigravity.

[![Release](https://img.shields.io/github/v/release/ajxcodes/critique?style=flat-square)](https://github.com/ajxcodes/critique/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Critique** provides automated, intelligent code reviews powered by Google Gemini (with seamless model fallback cascades: `gemini-3.5-flash-lite` ➔ `gemini-3.5-flash` ➔ `gemini-2.5-flash` ➔ `gemini-2.5-pro` ➔ Copilot `gpt-4o`). It operates as a local CLI tool (`critique`), a zero-dependency native GitHub Action, and an autonomous Google Antigravity skill and plugin.

---

## Features

- 🧠 **Tri-Packaging**: Run locally via the `critique` CLI, in CI/CD via `action.yml`, or in Google Antigravity as a skill/plugin.
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
        uses: ajxcodes/critique@v0.1.6
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          strict: false
```
 
### Local CI Testing with `act`

You can test GitHub Actions CI workflows locally using [`act`](https://github.com/nektos/act):

#### Docker (standard)

```bash
act push --job test
```

#### Podman (rootless)

Start the rootless Podman socket first, then point `act` to it via `DOCKER_HOST`:

```bash
# Start the rootless Podman socket (one-time per session)
systemctl --user start podman.socket

# Run the test job using the Podman socket
DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock act push --job test
```

> **Tip:** Export `DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock` in your shell profile so `act` automatically connects to Podman.

---

## Antigravity Skill & Plugin

Critique is packaged natively as an Antigravity skill and plugin, allowing autonomous agents to run quality gate reviews, inspect changes, and proactively generate conventional commit messages.

### Local Installation / Linking

Link Critique directly into your local Antigravity environment (`~/.gemini/config/`):

```bash
# Link as a standalone skill (~/.gemini/config/skills/critique)
npm run link:skill

# OR link as a full plugin (~/.gemini/config/plugins/critique)
npm run link:plugin
```

### Usage in Antigravity

Once linked, Antigravity agents can invoke Critique automatically or via slash commands:

- **Natural Language**: Simply ask the agent:
  - *"Run critique on my changes"*
  - *"Review this PR using critique"*
  - *"Check uncommitted changes with critique"*
- **Slash Command**: Run the `/critique` command directly:
  ```bash
  /critique
  /critique --staged
  /critique --base origin/main
  /critique --pr 42
  ```

---

## License

MIT © [Alvin Jorrel Pascual](https://github.com/ajxcodes)

