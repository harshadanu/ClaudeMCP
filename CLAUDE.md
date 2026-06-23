# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A **TechHub MCP (Model Context Protocol) server** built with Node.js. It exposes AI-callable tools that let AI assistants (Claude, ChatGPT, and other MCP clients) answer questions about TechHub's facilities and services.

**About TechHub:** TechHub operates the world's largest solar-powered data centre (Guinness World Record certified) at the Mohammed bin Rashid Al Maktoum Solar Park. It provides cloud services, data centre colocation, cybersecurity (24/7 SOC), managed services, and smart city solutions across the UAE.

All tool responses use hardcoded demo data — there are no external API calls or authentication dependencies.

## Commands

```bash
# Install dependencies
npm install

# Run the server in development mode (DEBUG logging)
npm run dev

# Run in production mode (INFO logging only)
npm start
```

Server starts on `http://localhost:8787/mcp` by default. Override with `PORT` env var.

## Architecture

```
src/
  server/
    app.js              — Entry point: validates setup, starts HTTP server
    mcp.js              — MCP server factory (new McpServer instance per request)
    httpServer.js       — HTTP server, routes /mcp to MCP transport, health check at /
  tools/
    index.js                  — Registers all tools onto the server
    get-locations.js          — "get_locations" tool
    get-services.js           — "get_services" tool
    get-data-centre-status.js — "get_data_centre_status" tool
    get-support-options.js    — "get_support_options" tool
    get-news.js               — "get_news" tool
  utils/
    logger.js           — File + console logger, daily log rotation (10 MB cap), logs/ dir
    client-detector.js  — Detects calling client (ChatGPT vs Claude) from user-agent
```

**Request flow:**
```
AI Client → POST /mcp → StreamableHTTPServerTransport → McpServer → tool handler → JSON response
```

**Client detection:** `client-detector.js` sets a module-level variable per request. Tools check `isChatGPT()` to decide response format — ChatGPT gets `structuredContent`; Claude and others get formatted text in `content[0].text`.

**One McpServer per request:** The MCP SDK requires a fresh `McpServer` instance per HTTP connection in stateless mode (`sessionIdGenerator: undefined`). `createMcpServer()` is called inside each request handler, not once at startup.

## Tools

| Tool | Input | Description |
|------|-------|-------------|
| `get_locations` | `userLatitude?`, `userLongitude?`, `category?` | 7 TechHub locations — HQ, data centres, Cyber Defence Centre, customer centres, Abu Dhabi office. Sorts by distance if coordinates given. |
| `get_services` | `category?` | 15 TechHub services across 6 categories: Cloud Services, Data Centre, Cybersecurity, Managed Services, Smart City & IoT, Professional Services. |
| `get_data_centre_status` | `facility?` | Live operational status of all 3 data centre facilities — uptime, PUE, rack availability, active incidents, sustainability metrics. |
| `get_support_options` | `type?` | All TechHub support channels — 24/7 emergency hotlines, SOC contact, customer support, email, portal, sales. Includes SLA tiers. |
| `get_news` | `category?`, `limit?` | Latest TechHub news, partnerships, awards, and press releases. Filter by category: Award, Partnership, Product Launch, Certification, Expansion. |

All tools return:
```js
{
  content: [{ type: "text", text: "..." }],   // for Claude / non-ChatGPT clients
  structuredContent: { ... }                  // structured data for ChatGPT widgets
}
```

## Service Categories

- **Cloud Services** — Cloud Hosting, Multi-Cloud Management, Cloud Migration
- **Data Centre** — Colocation, Disaster Recovery as a Service
- **Cybersecurity** — Managed SOC, VAPT, Identity & Access Management
- **Managed Services** — Managed IT, Managed Security
- **Smart City & IoT** — Smart City Solutions, IoT Platform
- **Professional Services** — Digital Transformation Consulting, AI & Analytics, Green IT Assessment

## Location Categories

- **Head Office** — Dubai Internet City HQ
- **Data Centre** — Solar Park (world's largest solar DC), Jebel Ali
- **Security Operations** — Cyber Defence Centre, Dubai Silicon Oasis
- **Customer Centre** — DIFC Customer Experience Centre
- **Innovation Centre** — Smart City Innovation Lab, Dubai Future District
- **Regional Office** — Abu Dhabi (Hub71, Al Maryah Island)

## Data Centre Status Fields

Each facility returns: `status`, `uptime`, `uptimeDays`, `tier`, `powerSource`, `pue`, `temperature`, `humidity`, `totalRacks`, `availableRacks`, `occupancyPercent`, `activeIncidents`, `certifications`

## Support SLA Tiers

- **Platinum** — 99.999% SLA, 15-min response, 24/7 dedicated
- **Gold** — 99.99% SLA, 1-hour response, 24/7 shared
- **Silver** — 99.9% SLA, 4-hour response, business hours

## News Categories

`Award` · `Partnership` · `Product Launch` · `Certification` · `Expansion`

## Adding a New Tool

1. Create `src/tools/my-tool.js` — export `registerMyTool(server)`
2. Use `z.object({...}).strict()` for the Zod input schema
3. Return hardcoded TechHub data; provide both text and `structuredContent`
4. Import and call `registerMyTool(server)` in `src/tools/index.js`

## Environment Variables

Copy `.env.example` to `.env` for local dev:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Controls log level (DEBUG vs INFO) |
| `PORT` | `8787` | HTTP server port |
| `MCP_SERVER_URL` | `http://localhost:PORT` | Self-reference URL (for widget CSP if added) |

## Connecting a Client

**Claude Desktop** — add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "techhub": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

**Claude Code CLI:**
```bash
claude mcp add techhub http://localhost:8787/mcp
```

**ChatGPT** — add `http://localhost:8787/mcp` as an MCP server in ChatGPT settings (requires public URL — use ngrok for local testing).

## Skills & Hooks (`.claude/`)

The `.claude/` directory contains Claude Code customizations demonstrating automation:

- **`settings.json`** — Hooks: auto-logs every shell command, file write/edit, and session end to `logs/claude-activity.log`
- **`commands/`** — Slash commands: `/status`, `/tools`, `/add-tool`, `/logs`
- **`agents/`** — Sub-agents: `tool-tester` (automated test suite), `server-monitor` (full health check), `data-updater` (safe data editing)

See `.claude/README.md` for details.
