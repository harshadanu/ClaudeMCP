# Claude Code Customizations — TechHub MCP Server

This directory configures Claude Code's behaviour when working in this repository.

## Hooks (`settings.json`)

Hooks are shell commands Claude Code runs **automatically** — no manual trigger needed.

| Event | Trigger | What it logs |
|-------|---------|-------------|
| `PreToolUse` → Bash | Before Claude runs any shell command | The command text (first 80 chars) |
| `PostToolUse` → Write | After Claude creates a file | File path + timestamp |
| `PostToolUse` → Edit | After Claude edits a file | File path + timestamp |
| `Stop` | When Claude ends a session | Session end timestamp |

All activity is appended to `logs/claude-activity.log`.

---

## Slash Commands (`commands/`)

Type these directly in the Claude Code prompt:

| Command | Example | What it does |
|---------|---------|-------------|
| `/status` | `/status` | Checks if the server is running on :8787, shows recent log errors |
| `/tools` | `/tools` | Lists all 5 tools, live-tests each one against the running server |
| `/add-tool` | `/add-tool announcements` | Scaffolds a new TechHub tool file + registers it in index.js |
| `/logs` | `/logs` | Shows today's server log + Claude activity log, highlights errors |

---

## Agents (`agents/`)

Invoke these by telling Claude to run them by name:

| Agent | How to invoke | What it does |
|-------|--------------|-------------|
| `tool-tester` | `Run the tool-tester agent` | Runs 11 test cases across all 5 tools, produces a pass/fail table |
| `server-monitor` | `Run the server-monitor agent` | Full health check: process, HTTP endpoint, MCP handshake, tools count, logs, env |
| `data-updater` | `Run the data-updater agent to add a new news article about...` | Safely edits data arrays in any of the 5 tool files |

---

## Tools covered

| Tool file | Data array | Records |
|-----------|-----------|---------|
| `get-locations.js` | `MORO_HUB_LOCATIONS` | 7 UAE facilities |
| `get-services.js` | `MORO_HUB_SERVICES` | 15 services across 6 categories |
| `get-data-centre-status.js` | `DATA_CENTRE_STATUS.facilities` | 3 DC facilities with live-feel metrics |
| `get-support-options.js` | `SUPPORT_OPTIONS` | 7 support channels + 3 SLA tiers |
| `get-news.js` | `MORO_HUB_NEWS` | 6 news articles (partnerships, awards, launches) |
