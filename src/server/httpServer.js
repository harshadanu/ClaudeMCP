import "dotenv/config";
import http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { logger } from "../utils/logger.js";
import { setCurrentClient } from "../utils/client-detector.js";
import { createMcpServer } from "./mcp.js";

const MCP_PORT = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

function getSourceIP(req) {
  const xForwardedFor = req.headers["x-forwarded-for"];
  const xRealIp = req.headers["x-real-ip"];
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  if (cfConnectingIp) return cfConnectingIp;
  if (xRealIp) return xRealIp;
  return req.socket.remoteAddress || "unknown";
}

export async function startHttpServer(options = {}) {
  const { port = MCP_PORT } = options;

  const httpServer = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }

    const host = req.headers.host || "localhost";
    let rawUrl = req.url || "/";
    if (!rawUrl.startsWith("/") || rawUrl.startsWith("//")) rawUrl = "/";

    let url;
    try {
      url = new URL(rawUrl, `http://${host}`);
    } catch {
      res.writeHead(400).end("Invalid URL");
      return;
    }

    // Health check
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/plain" }).end("Moro Hub MCP Server is running");
      logger.info("Health check", { status: 200 });
      return;
    }

    // CORS preflight
    if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    // MCP endpoint — create a fresh server + transport per request (stateless mode)
    const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
    if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
      const userAgent = req.headers["user-agent"];
      setCurrentClient(userAgent);

      logger.info("Incoming MCP request:", {
        method: req.method,
        path: url.pathname,
        sourceIP: getSourceIP(req),
        userAgent,
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

      // New McpServer + stateless transport per request
      const mcpServer = await createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless
      });

      try {
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);
      } catch (error) {
        logger.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500).end("Internal server error");
        }
      } finally {
        await transport.close().catch(() => {});
      }
      return;
    }

    res.writeHead(404).end("Not found");
  });

  httpServer.listen(port, () => {
    logger.info(`Moro Hub MCP Server listening on http://localhost:${port}${MCP_PATH}`);
  });
}
