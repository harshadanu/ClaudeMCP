# Moro Hub MCP Server

A fully functional **Model Context Protocol (MCP) server** built with Node.js, exposing Moro Hub's services, facilities, and operational data as AI-callable tools. Connect it to Claude, ChatGPT, or any MCP-compatible AI client and ask natural language questions about Moro Hub.

> Built as part of the **Anthropic Cohort Alpha** application — demonstrating all 4 Level 1 modules:
> Agent Skills · Building with the Claude API · Introduction to MCP · Claude Code in Action

---

## What This Server Does

Once connected to an AI client, you can ask:

```
"What services does Moro Hub offer?"
"Is the Solar Park data centre operational right now?"
"What cybersecurity services are available?"
"Show me Moro Hub locations near DIFC"
"How do I contact Moro Hub support in an emergency?"
"What's the latest news from Moro Hub?"
"Show me all partnership announcements"
```

The AI calls the appropriate MCP tool, retrieves the data, and answers conversationally — no UI, no manual lookup.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start the server (development)
npm run dev
# → Moro Hub MCP Server listening on http://localhost:8787/mcp
```

### Connect to Claude Code

```bash
claude mcp add --transport http morohub http://localhost:8787/mcp
claude mcp list   # → morohub: http://localhost:8787/mcp (HTTP) - ✓ Connected
```

### Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "morohub": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

---

## MCP Tools (5 total)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get_locations` | `userLatitude?` `userLongitude?` `category?` | 7 Moro Hub UAE facilities. Sorts by distance if coordinates provided. |
| `get_services` | `category?` | 15 services across 6 categories — Cloud, Data Centre, Cybersecurity, Managed Services, Smart City & IoT, Professional Services. |
| `get_data_centre_status` | `facility?` | Live-feel operational status of all 3 DC facilities — uptime, PUE, rack availability, incidents, sustainability metrics. |
| `get_support_options` | `type?` | 7 support channels — 24/7 emergency hotlines, SOC contact, portal, sales. Includes SLA tiers. |
| `get_news` | `category?` `limit?` | 6 news articles — partnerships, awards, product launches, certifications, expansions. |

### Location Categories
`Head Office` · `Data Centre` · `Security Operations` · `Customer Centre` · `Innovation Centre` · `Regional Office`

### Service Categories
`Cloud Services` · `Data Centre` · `Cybersecurity` · `Managed Services` · `Smart City & IoT` · `Professional Services`

### News Categories
`Award` · `Partnership` · `Product Launch` · `Certification` · `Expansion`

---

## Sample Conversations

### Locations
```
"Where is Moro Hub's headquarters?"
"Show me all data centre locations"
"Find the Cyber Defence Centre"
"Which Moro Hub facility is closest to me?"   ← Claude asks for your coordinates
"Show locations filtered by Security Operations"
```

### Services
```
"What cloud services does Moro Hub offer?"
"Tell me about the Managed SOC service"
"Does Moro Hub offer cloud migration?"
"What smart city solutions are available?"
"List all professional services"
```

### Data Centre Status
```
"Is the data centre operational?"
"What's the uptime of the Solar Park facility?"
"Show me rack availability across all facilities"
"What certifications does the Solar Park DC hold?"
"How much CO₂ has Moro Hub saved today?"
```

### Support
```
"How do I contact Moro Hub support?"
"What's the emergency hotline number?"
"How do I report a cyber incident?"
"What are Moro Hub's SLA tiers?"
"How do I book a visit to the data centre?"
```

### News
```
"What's the latest news from Moro Hub?"
"Show me recent partnership announcements"
"Has Moro Hub won any awards?"
"Tell me about the Emirates Group partnership"
"What new products has Moro Hub launched?"
```

---

## Project Structure

```
src/
├── server/
│   ├── app.js              # Entry point
│   ├── mcp.js              # MCP server factory (new instance per request)
│   └── httpServer.js       # HTTP server, /mcp endpoint, health check at /
├── tools/
│   ├── index.js            # Registers all tools
│   ├── get-locations.js    # 7 UAE facility locations
│   ├── get-services.js     # 15 Moro Hub services
│   ├── get-data-centre-status.js  # 3 DC facilities with metrics
│   ├── get-support-options.js     # 7 support channels + SLA tiers
│   └── get-news.js         # 6 news articles
└── utils/
    ├── logger.js           # File + console logger, daily rotation
    └── client-detector.js  # Detects ChatGPT vs Claude from user-agent
```

**Key architectural note:** The MCP SDK requires a fresh `McpServer` instance per HTTP connection in stateless mode. `sessionIdGenerator: undefined` is set on `StreamableHTTPServerTransport` — this is required for HTTP MCP servers.

---

## Claude Code Integration

This repo demonstrates Claude Code's full automation capabilities via the `.claude/` directory.

### Hooks (`.claude/settings.json`) — automatic, no trigger needed

| Event | Fires when | Logs to |
|-------|-----------|---------|
| `PreToolUse → Bash` | Before any shell command | `logs/claude-activity.log` |
| `PostToolUse → Write` | After a file is created | `logs/claude-activity.log` |
| `PostToolUse → Edit` | After a file is edited | `logs/claude-activity.log` |
| `Stop` | Session ends | `logs/claude-activity.log` |

### Slash Commands (`.claude/commands/`)

```bash
/status       # Is the server running? Any log errors?
/tools        # List all 5 tools and live-test each one
/add-tool     # Scaffold a new Moro Hub tool: /add-tool announcements
/logs         # Show server log + Claude activity log
```

### Agents (`.claude/agents/`)

```
"Run the tool-tester agent"
→ Executes 11 test cases across all 5 tools, produces a pass/fail table

"Run the server-monitor agent"
→ 6-point health check: process · HTTP · MCP handshake · tools count · logs · env

"Run the data-updater agent to add a new news article about..."
→ Reads the target file, validates the data shape, edits safely, confirms
```

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | `development` = DEBUG logs, `production` = INFO only |
| `PORT` | `8787` | HTTP server port |
| `MCP_SERVER_URL` | `http://localhost:PORT` | Self-reference URL |

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server framework |
| `zod` | Input schema validation |
| `dotenv` | Environment variable loading |
| Node.js `http` | HTTP server (no framework needed) |

---

## Anthropic Academy — Level 1 Modules Demonstrated

| Module | Where in this repo |
|--------|-------------------|
| **01 · Introduction to Agent Skills** | `.claude/agents/` — 3 agents with frontmatter, focused roles, and structured instructions |
| **02 · Building with the Claude API** | Full MCP server using `@modelcontextprotocol/sdk` — tool registration, structured responses, client detection |
| **03 · Introduction to Model Context Protocol** | Stateless HTTP MCP server, `StreamableHTTPServerTransport`, 5 registered tools, CORS, health endpoint |
| **04 · Claude Code in Action** | `CLAUDE.md`, `.claude/settings.json` hooks, 4 slash commands, `claude mcp add --transport http` |

---

## Scripts

```bash
npm run dev    # Start with DEBUG logging (NODE_ENV=development)
npm start      # Start with INFO logging (NODE_ENV=production)
```

---

*Built with Claude Code · Moro Hub MCP Server v1.0.0*
