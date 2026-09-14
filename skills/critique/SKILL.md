---
name: critique
description: Trigger this skill when the user asks to run critique, run the AI PR reviewer, review a PR, or check uncommitted changes.
---

# Critique Code Review Skill

When the user asks you to perform a code review, run critique, evaluate changes, or check uncommitted diffs:

## Instructions

1. Run the `critique` CLI via an interactive bash session using the smart resolver hierarchy (sibling `../critique`, bundled `./bin/critique.js`, user data directories, user-local `~/.local/bin/critique`, or system `$PATH`):
   ```bash
   bash -i -c 'if [ -f ../critique/bin/critique.js ]; then node ../critique/bin/critique.js; elif [ -f ./bin/critique.js ]; then node ./bin/critique.js; elif [ -f "$HOME/Library/Application Support/critique/bin/critique.js" ]; then node "$HOME/Library/Application Support/critique/bin/critique.js"; elif [ -f "${XDG_DATA_HOME:-$HOME/.local/share}/critique/bin/critique.js" ]; then node "${XDG_DATA_HOME:-$HOME/.local/share}/critique/bin/critique.js"; elif [ -x ~/.local/bin/critique ]; then ~/.local/bin/critique; else critique; fi'
   ```

2. **Flag Guidance**:
   Append options to the resolver command based on user intent:
   - `--staged`: Review only staged git changes (`git diff --cached`).
   - `--base <branch>`: Review changes against a specific base branch or commit (e.g., `--base origin/main`).
   - `--pr <num>`: Review a pull request by number using the GitHub CLI (`gh`).
   - `--strict`: Exit with code 1 if blocking or warning issues are detected.
   - `--json`: Output raw structured JSON instead of formatted Markdown.

3. **Output Presentation**:
   - Wait for the command to complete.
   - Present the resulting Markdown output directly to the user.

4. **Conventional Commit Generation**:
   - If the Confidence level is "High" and there are no unresolved issues or blocking findings, proactively generate a Conventional Commit message based on the summary and provide it to the user so they can easily commit the changes.
