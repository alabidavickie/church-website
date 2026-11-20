# Church website starter kit

Everything a coding agent needs to build the [Church Name] website, from the blueprint to the finished design. It is set up for Claude Code and also works with Codex, Cursor, GitHub Copilot and other agents that read `AGENTS.md`.

## Start here

1. Install Claude Code (see https://code.claude.com/docs/en/overview), Node.js 22 LTS, Git, the GitHub CLI, the Vercel CLI, the Supabase CLI, Docker Desktop (for the local test database), Python 3 (for UI/UX Pro Max) and the Stripe CLI (`npm install -g @stripe/cli@latest`, then `stripe login` and `stripe agent setup`).
2. Put this folder where you keep your projects, rename it `church-website`, and run `git init` inside it.
3. Copy `.env.example` to `.env.local` and fill in the TEST keys yourself.
4. Fill in `docs/CLIENT-DETAILS.md` with the church's answers.
5. Open a terminal in the folder and run `claude`.
6. Install the ready-made skills:
   ```
   npx skills add supabase/agent-skills
   npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
   npx skills add vercel-labs/agent-skills --skill web-design-guidelines
   npx skills add vercel/next.js --skill next-dev-loop
   npx skills add vercel-labs/agent-skills --skill deploy-to-vercel
   npx skills add stripe/ai --skill stripe-best-practices
   ```
   If one fails because a repository moved, run `npx skills find <name>`.

   And the two design skills chosen for this project:
   ```
   npx ui-ux-pro-max-cli init --ai claude
   npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
   ```
   UI/UX Pro Max needs Python 3; taste-skill needs Node 22 or later and Chrome, Edge or Chromium. Inside Claude Code you can install them as plugins instead: `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`, and `/plugin marketplace add Leonxlnx/taste-skill` then `/plugin install taste-skill@taste-skill`.
7. Connect Supabase, Vercel, Stripe and a browser for testing (then run `/mcp` inside Claude Code and sign in to each):
   ```
   claude mcp add --transport http supabase https://mcp.supabase.com/mcp
   claude mcp add --transport http vercel https://mcp.vercel.com
   claude mcp add --transport http stripe https://mcp.stripe.com/
   claude mcp add playwright npx @playwright/mcp@latest
   ```
   Keep Stripe in test mode until phase 11.
8. In Claude Code, run `/context` and check that CLAUDE.md and the `church-site` skill are listed.
9. Follow `PROMPTS.md`, one phase per session, starting with phase 0.

## What's inside

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Project rules for every coding agent |
| `CLAUDE.md` | Loads `AGENTS.md` into Claude Code, plus Claude Code tips |
| `.claude/skills/church-site/` | Custom build skill: phases, rules, checks |
| `.claude/agents/security-reviewer.md` | Fresh-eyes security and privacy review |
| `.claude/settings.json` | Blocks Claude Code from reading secret `.env` files |
| `.cursorignore` | Keeps Cursor away from secret `.env` files |
| `docs/BLUEPRINT.md` | Full build blueprint |
| `docs/CLIENT-DETAILS.md` | The church's answers and open decisions |
| `docs/TESTING.md` | Test commands, test keys, test data and bug levels |
| `design/template-b/` | All 45 Template B pages; open `all-pages.html` |
| `.env.example` | Names of every key the site needs |
| `PROMPTS.md` | The prompt for each build phase |

## Using another coding agent

Codex, Cursor, GitHub Copilot and most other agents read `AGENTS.md`. For any agent:

- Start each phase with the prompt in `PROMPTS.md`, replacing `/church-site N` with "Read AGENTS.md and .claude/skills/church-site/SKILL.md, then do phase N."
- The skills installer (`npx skills add ...`) asks which agents to install for; pick yours. UI/UX Pro Max takes the agent name: `npx ui-ux-pro-max-cli init --ai <agent>` (run `npx ui-ux-pro-max-cli init --help` for the list).
- `.claude/settings.json` protects `.env` files in Claude Code only. Other agents may be able to open them, so keep only TEST keys in `.env.local` and never live keys.
- Use one agent per phase, and finish a phase (checks passing, committed) before switching agents.

## Keys and passwords

Never paste a secret key into Claude Code, a chat or an email. Test keys go in `.env.local` (never committed). Live keys are entered by the church directly in Vercel's environment variable settings.
