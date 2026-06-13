import "dotenv/config";

import { validateMcpSetup } from "./mcp.js";
import { startHttpServer } from "./httpServer.js";

// Validate setup once at startup, then serve — each request gets a fresh McpServer instance
await validateMcpSetup();
await startHttpServer();
