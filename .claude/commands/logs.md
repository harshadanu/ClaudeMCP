Show recent server and activity logs for the TechHub MCP Server.

1. Find today's server log:
   - Run: `ls -la logs/ 2>/dev/null || echo "No logs directory found"`
   - Show the last 30 lines of today's log: `tail -30 logs/$(date +%Y-%m-%d).log 2>/dev/null || echo "No server log for today"`

2. Show Claude activity log if it exists:
   - Run: `tail -20 logs/claude-activity.log 2>/dev/null || echo "No Claude activity log yet"`

3. Highlight any ERROR or CRITICAL entries in red (describe them clearly)

4. Report:
   - Total log files found
   - Date range covered
   - Count of errors/warnings in today's log
   - Last tool invocation recorded
