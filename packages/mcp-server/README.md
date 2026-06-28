# @flightrec/mcp-server

A read-only [MCP](https://modelcontextprotocol.io) server over recorded `.frec` traces. It lets an
agent query Flightrec sessions **fully offline** — no running app, no network. Record first, enrich
second: the server only reads the bundles the recorder already wrote.

## Tools

| Tool             | Args | Returns |
| ---------------- | ---- | ------- |
| `list_sessions`  | —    | recorded sessions (newest first): id, app, route, event count |
| `get_session`    | `id` | the full schema-validated `.frec` JSON |
| `get_timeline`   | `id` | plain-English, tick-numbered narration of the session |
| `diagnose_cache` | `id` | each cache write classified `immediate-freshness` / `orphaned-invalidation`, naming the Server Action — answers *"which action caused this stale state?"* |

## Run

The server reads `.frec` files from a directory, resolved as:
`$FLIGHTREC_DIR` → first CLI arg → `<cwd>/.flightrec` (where the dev recorder writes).

```bash
pnpm --filter @flightrec/mcp-server start /path/to/.flightrec
```

### Wire into an MCP client

```jsonc
{
  "mcpServers": {
    "flightrec": {
      "command": "pnpm",
      "args": ["--filter", "@flightrec/mcp-server", "start"],
      "env": { "FLIGHTREC_DIR": "/abs/path/to/your-app/.flightrec" }
    }
  }
}
```

<!-- ponytail: runs from TS via tsx; add a tsup build + `bin` when this package is published to npm. -->
