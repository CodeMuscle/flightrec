import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { join } from "node:path";
import { z } from "zod";
import { diagnoseCache, summary, timeline } from "./queries";
import { listSessions, loadSession } from "./store";

// Where the `.frec` files live. The dev recorder writes them to `<app>/.flightrec`.
const DIR = process.env.FLIGHTREC_DIR ?? process.argv[2] ?? join(process.cwd(), ".flightrec");

const text = (data: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    },
  ],
});
const notFound = (id: string) => ({
  content: [{ type: "text" as const, text: `No session "${id}" in ${DIR}` }],
  isError: true,
});

const server = new McpServer({ name: "flightrec", version: "0.1.0" });

server.registerTool(
  "list_sessions",
  {
    title: "List sessions",
    description: "List recorded Flightrec sessions (newest first) with id, route, and event count.",
    inputSchema: {},
  },
  async () => text(listSessions(DIR).map(summary)),
);

server.registerTool(
  "get_session",
  {
    title: "Get session",
    description: "Return the full schema-validated .frec session JSON for an id.",
    inputSchema: { id: z.string().describe("Session id, e.g. ses_8f31a0") },
  },
  async ({ id }) => {
    const s = loadSession(DIR, id);
    return s ? text(s) : notFound(id);
  },
);

server.registerTool(
  "get_timeline",
  {
    title: "Get timeline",
    description:
      "A plain-English, tick-numbered narration of a session — the fastest way to read it.",
    inputSchema: { id: z.string().describe("Session id") },
  },
  async ({ id }) => {
    const s = loadSession(DIR, id);
    return s ? text(timeline(s)) : notFound(id);
  },
);

server.registerTool(
  "diagnose_cache",
  {
    title: "Diagnose cache",
    description:
      "Classify each cache write in a session as immediate-freshness or orphaned-invalidation, " +
      "naming the Server Action responsible. Answers 'which action caused this stale state?'.",
    inputSchema: { id: z.string().describe("Session id") },
  },
  async ({ id }) => {
    const s = loadSession(DIR, id);
    return s ? text(diagnoseCache(s)) : notFound(id);
  },
);

const transport = new StdioServerTransport();
// stdout is the JSON-RPC channel — only ever log to stderr.
server.connect(transport).then(
  () => console.error(`flightrec MCP server ready · reading ${DIR}`),
  (err) => {
    console.error("flightrec MCP server failed to start:", err);
    process.exit(1);
  },
);
