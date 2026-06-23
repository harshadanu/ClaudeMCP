Check the current health and status of the TechHub MCP Server.

1. Check if the server process is running on port 8787:
   - Run: `lsof -i :8787 | grep LISTEN`
   - If running, report PID and confirm the server is up
   - If not running, report that the server is down

2. Check the latest log entries:
   - Run: `tail -20 logs/$(date +%Y-%m-%d).log 2>/dev/null || echo "No log file found for today"`
   - Summarize any warnings or errors found

3. Test the health endpoint:
   - Run: `curl -s http://localhost:8787/ 2>/dev/null || echo "Server not reachable"`

4. Report a concise status summary with:
   - Server status (running / stopped)
   - Port and endpoint URL
   - Any recent errors from logs
   - Suggestion to run `npm run dev` if server is down
   - Remind that the server exposes TechHub locations and services via MCP at /mcp
