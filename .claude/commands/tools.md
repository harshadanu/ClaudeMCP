List and test all registered MCP tools in the Moro Hub MCP Server.

1. Read `src/tools/index.js` to identify all registered tools
2. For each tool file found in `src/tools/` (excluding index.js):
   - Read the file
   - Extract: tool name, description, input schema fields, number of hardcoded records
3. If the server is running (check port 8787), send a test request to each tool:
   - Test `get_locations` with no args: `curl -s -X POST http://localhost:8787/mcp -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_locations","arguments":{}}}'`
   - Test `get_services` with no args: `curl -s -X POST http://localhost:8787/mcp -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_services","arguments":{}}}'`
4. Present a clean summary table:
   | Tool | Description | Parameters | Records |
   with live response status if server was reachable.
