import { redactSession } from "@flightrec/recorder/redact";
import { blogPostSession } from "@flightrec/trace-fixtures";
import { describe, expect, it } from "vitest";
import { parseFrec, serializeFrec } from "./frec";

describe("frec round-trip", () => {
  it("serialize → parse yields the redacted session (secrets masked on export)", () => {
    const original = blogPostSession();
    const result = parseFrec(serializeFrec(original));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.session).toEqual(redactSession(original));
  });

  it("rejects non-JSON", () => {
    expect(parseFrec("not json {").ok).toBe(false);
  });

  it("rejects JSON that fails the schema", () => {
    expect(parseFrec(JSON.stringify({ id: "x", schemaVersion: 1 })).ok).toBe(false);
  });
});
