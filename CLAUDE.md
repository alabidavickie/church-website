@AGENTS.md

## Claude Code
- Start each phase with `/church-site <phase number>` in plan mode (see `PROMPTS.md`).
- Use the `security-reviewer` agent on each phase's changes before asking the user to commit.
- `.claude/settings.json` blocks reading `.env` files; never try to get around it.
