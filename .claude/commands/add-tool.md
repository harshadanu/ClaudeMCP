Scaffold a new MCP tool in the Moro Hub MCP Server.

The user will provide: $ARGUMENTS (tool name and optional description)

Steps:
1. Parse $ARGUMENTS to extract the tool name (convert to snake_case for the tool ID, kebab-case for the filename)
2. Read `src/tools/get-services.js` as a reference for the file structure
3. Create `src/tools/{kebab-name}.js` with:
   - A descriptive Moro Hub data array with at least 3 realistic hardcoded records
   - A Zod input schema (at minimum allow an optional `query` string filter)
   - A tool handler that filters by query if provided, returns all records otherwise
   - Both text response (for Claude) and structuredContent response
   - Proper logger calls
4. Edit `src/tools/index.js` to import and register the new tool
5. Confirm the tool was added and show the tool name, file path, and how to test it
