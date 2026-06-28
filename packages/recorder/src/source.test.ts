import { describe, expect, it } from "vitest";
import { captureSource, formatSourceRef, parseStack } from "./source";

const ROOT = "/proj/apps/web";

describe("parseStack", () => {
  it("picks the first app frame, relativized, with symbol + line", () => {
    const stack = [
      "Error",
      "    at captureSource (/proj/packages/recorder/src/source.ts:30:20)",
      "    at recordServerActionStart (/proj/packages/recorder/src/helpers.ts:11:21)",
      "    at createPost (/proj/apps/web/app/posts/actions.ts:12:34)",
      "    at /proj/apps/web/app/posts/new/page.tsx:5:1",
    ].join("\n");
    expect(parseStack(stack, { root: ROOT })).toEqual({
      file: "app/posts/actions.ts",
      symbol: "createPost",
      line: 12,
      col: 34,
    });
  });

  it("handles anon frames (no fn name) → empty symbol", () => {
    const stack = ["Error", "    at /proj/apps/web/app/x.ts:7:2"].join("\n");
    expect(parseStack(stack, { root: ROOT })).toMatchObject({ file: "app/x.ts", symbol: "" });
  });

  it("strips async/Object. wrappers from the symbol", () => {
    const stack = [
      "Error",
      "    at async Object.signIn (/proj/apps/web/app/login/actions.ts:3:9)",
    ].join("\n");
    expect(parseStack(stack, { root: ROOT })?.symbol).toBe("signIn");
  });

  it("skips node internals, node_modules, and recorder frames", () => {
    const stack = [
      "Error",
      "    at run (node:internal/process/task:95:5)",
      "    at next (/proj/node_modules/next/dist/server.js:1:1)",
      "    at recordEvent (/proj/packages/recorder/src/context.ts:24:10)",
      "    at handler (/proj/apps/web/app/api/route.ts:8:3)",
    ].join("\n");
    expect(parseStack(stack, { root: ROOT })).toMatchObject({ file: "app/api/route.ts" });
  });

  it("keeps app files merely named 'recorder' (only the package is skipped)", () => {
    const stack = ["Error", "    at Page (/proj/apps/web/app/recorder/page.tsx:4:2)"].join("\n");
    expect(parseStack(stack, { root: ROOT })).toMatchObject({
      file: "app/recorder/page.tsx",
      symbol: "Page",
    });
  });

  it("returns null when no app frame exists", () => {
    const stack = ["Error", "    at run (node:internal/x:1:1)"].join("\n");
    expect(parseStack(stack, { root: ROOT })).toBeNull();
  });
});

describe("formatSourceRef", () => {
  // The "file:symbol" shape is the contract derive's parseSourceRef reads back (split on last ":").
  it("formats file:symbol", () => {
    expect(formatSourceRef({ file: "app/posts/actions.ts", symbol: "createPost" })).toBe(
      "app/posts/actions.ts:createPost",
    );
  });

  it("omits the colon when there is no symbol", () => {
    expect(formatSourceRef({ file: "app/x.ts", symbol: "" })).toBe("app/x.ts");
  });
});

describe("captureSource", () => {
  it("never throws on a malformed stack", () => {
    expect(captureSource({ stack: "garbage with no frames" })).toBeNull();
  });
});
