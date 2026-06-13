import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "../tools/index.js";
import { logger } from "../utils/logger.js";

// Creates a fresh McpServer instance per request (required by MCP SDK for stateless HTTP)
export async function createMcpServer() {
  const server = new McpServer({
    name: "morohub-mcp-server",
    version: "1.0.0",
  });

  await registerTools(server);
  return server;
}

// Called once at startup to validate tool registration loads without errors
export async function validateMcpSetup() {
  logger.info("Validating MCP tool registration...");
  const server = await createMcpServer();
  logger.info("MCP Server setup valid — tools registered successfully");
  return server;
}
