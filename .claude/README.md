# Claude Code Customizations — Moro Hub MCP Server

This directory configures Claude Code's behaviour when working in this repository.

## Hooks (`settings.json`)

Hooks are shell commands Claude Code runs automatically — no manual trigger needed.

| Hook | Trigger | What it does |
|------|---------|-------------|
| `PreToolUse` on Bash | Before any shell command | Logs the command to `logs/claude-activity.log` |
| `PostToolUse` on Write | After Claude writes a file | Logs file path + timestamp |
| `PostToolUse` on Edit | After Claude edits a file | Logs file path + timestamp |
| `Stop` | When Claude ends a session | Logs session end time |

Activity log: `logs/claude-activity.log`

## Slash Commands (`commands/`)

| Command | Usage | What it does |
|---------|-------|-------------|
| `/status` | `/status` | Check if server is running, show recent logs |
| `/tools` | `/tools` | List all Moro Hub tools and live-test them |
| `/add-tool` | `/add-tool announcements` | Scaffold a new tool and register it |
| `/logs` | `/logs` | Show formatted server and activity logs |

## Agents (`agents/`)

| Agent | How to invoke | Purpose |
|-------|--------------|---------|
| `tool-tester` | `Run the tool-tester agent` | Tests all tools, produces pass/fail report |
| `server-monitor` | `Run the server-monitor agent` | Full health check — process, endpoint, MCP handshake, logs |
| `data-updater` | `Run the data-updater agent to add a new Moro Hub location called ...` | Safely updates locations or services data |
