import { blogPostSession } from "@flightrec/trace-fixtures";
import { Phase } from "@flightrec/trace-schema";
import { describe, expect, it } from "vitest";
import {
  clampTick,
  eventAtTick,
  eventsUpTo,
  filterEvents,
  PLANES,
  planeForPhase,
  planeLanes,
  tickBounds,
  paneBuckets,
  eventDetail,
  eventsAtTick,
  previousOnPlane,
  mutations,
  cacheOutcome,
  activeCacheTags,
  parseSourceRef,
  rscFramesUpTo,
  frameOps,
  causalChain,
} from "./derive";

const session = blogPostSession();

describe("planeForPhase", () => {
  it("maps every schema phase to a known plane (total mapping)", () => {
    for (const phase of Phase.options) {
      expect(PLANES).toContain(planeForPhase(phase));
    }
  });

  it("groups the phases the way the IA spec says", () => {
    expect(planeForPhase("user-input")).toBe("user");
    expect(planeForPhase("server-action:start")).toBe("action");
    expect(planeForPhase("cookies:mutate")).toBe("action");
    expect(planeForPhase("cache:update-tag")).toBe("cache");
    expect(planeForPhase("redirect")).toBe("net");
    expect(planeForPhase("rsc:chunk")).toBe("rsc");
    expect(planeForPhase("tree:diff")).toBe("tree");
  });
});

describe("tickBounds / clampTick", () => {
  it("spans the golden session's 12 ticks", () => {
    expect(tickBounds(session)).toEqual({ min: 0, max: 11 });
  });

  it("clamps out-of-range and rounds fractional ticks", () => {
    expect(clampTick(session, -5)).toBe(0);
    expect(clampTick(session, 99)).toBe(11);
    expect(clampTick(session, 6.4)).toBe(6);
  });
});

describe("eventsUpTo", () => {
  it("includes only events at or before the playhead", () => {
    expect(eventsUpTo(session, -1)).toHaveLength(0);
    expect(eventsUpTo(session, 0)).toHaveLength(1);
    expect(eventsUpTo(session, 6)).toHaveLength(7);
    expect(eventsUpTo(session, 11)).toHaveLength(session.events.length);
  });

  it("grows monotonically as the tick advances", () => {
    let prev = 0;
    for (let t = 0; t <= 11; t++) {
      const n = eventsUpTo(session, t).length;
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
  });
});

describe("eventAtTick", () => {
  it("returns the createPost server action at tick 3", () => {
    const e = eventAtTick(session, 3);
    expect(e?.phase).toBe("server-action:start");
    expect(e?.actionName).toBe("createPost");
  });

  it("is undefined past the last tick", () => {
    expect(eventAtTick(session, 99)).toBeUndefined();
  });
});

describe("planeLanes", () => {
  it("always returns all 6 planes in fixed order", () => {
    expect(planeLanes(session, 0).map((l) => l.plane)).toEqual([...PLANES]);
  });

  it("partitions every event into exactly one lane", () => {
    const total = planeLanes(session, 11).reduce((sum, lane) => sum + lane.dots.length, 0);
    expect(total).toBe(session.events.length);
  });

  it("marks dots past/future relative to the tick", () => {
    const action = planeLanes(session, 3).find((l) => l.plane === "action")!;
    // the createPost:start at tick 3 is past; the :end at tick 6 is future.
    expect(action.dots.find((d) => d.event.tick === 3)?.isPast).toBe(true);
    expect(action.dots.find((d) => d.event.tick === 6)?.isPast).toBe(false);
  });
});

describe("filterEvents", () => {
  it("returns everything when all planes are active", () => {
    expect(filterEvents(session, new Set(PLANES))).toHaveLength(session.events.length);
  });

  it("returns nothing when no plane is active", () => {
    expect(filterEvents(session, new Set())).toHaveLength(0);
  });

  it("keeps only events on the active planes", () => {
    expect(filterEvents(session, new Set(["action"]))).toHaveLength(3); // ticks 3, 5, 6
    expect(filterEvents(session, new Set(["user", "tree"]))).toHaveLength(5); // 3 + 2
  });
});

describe("paneBuckets", () => {
  it("buckets cumulative past events by plane", () => {
    const at6 = paneBuckets(session, 6);
    expect(at6.action).toHaveLength(3); // ticks 3, 5, 6
    expect(at6.cache).toHaveLength(1); // tick 4
    expect(at6.net).toHaveLength(0);
    expect(at6.rsc).toHaveLength(0);
  });

  it("is empty before the first event and full at the end", () => {
    expect(paneBuckets(session, -1).user).toHaveLength(0);
    const end = paneBuckets(session, 11);
    const total = PLANES.reduce((n, p) => n + end[p].length, 0);
    expect(total).toBe(session.events.length);
  });
});

describe("eventDetail", () => {
  it("describes a cache update and a redirect", () => {
    const cache = session.events.find((e) => e.phase === "cache:update-tag")!;
    const redirect = session.events.find((e) => e.phase === "redirect")!;
    expect(eventDetail(cache)).toBe("updateTag('posts')");
    expect(eventDetail(redirect)).toContain("/posts/42");
  });
});

describe("eventsAtTick", () => {
  it("returns the event(s) on a tick, empty past the end", () => {
    expect(eventsAtTick(session, 3).map((e) => e.phase)).toEqual(["server-action:start"]);
    expect(eventsAtTick(session, 99)).toHaveLength(0);
  });
});

describe("previousOnPlane", () => {
  it("finds the latest earlier event on a plane", () => {
    expect(previousOnPlane(session, "action", 6)?.tick).toBe(5); // cookies:mutate, before the :end at 6
    expect(previousOnPlane(session, "action", 3)).toBeUndefined();
  });
});

describe("parseSourceRef", () => {
  it("splits file:symbol, null on undefined", () => {
    expect(parseSourceRef("app/posts/actions.ts:createPost")).toEqual({
      file: "app/posts/actions.ts",
      symbol: "createPost",
    });
    expect(parseSourceRef(undefined)).toBeNull();
  });
});

describe("activeCacheTags", () => {
  it("accumulates unique tags up to the tick", () => {
    expect(activeCacheTags(session, 3)).toEqual([]);
    expect(activeCacheTags(session, 4)).toEqual(["posts"]);
    expect(activeCacheTags(session, 11)).toEqual(["posts"]);
  });
});

describe("cacheOutcome", () => {
  it("flips orphaned → fresh once a render lands", () => {
    expect(cacheOutcome(session, 0)).toBeNull();
    expect(cacheOutcome(session, 4)).toBe("orphaned-invalidation");
    expect(cacheOutcome(session, 11)).toBe("immediate-freshness");
  });
});

describe("mutations", () => {
  it("lists cookie/header mutations up to the tick", () => {
    expect(mutations(session, 4)).toHaveLength(0);
    expect(mutations(session, 5)).toEqual([{ kind: "cookie", key: "last_post", value: "42" }]);
  });
});

describe("rscFramesUpTo / frameOps", () => {
  it("collects frames up to the tick", () => {
    expect(rscFramesUpTo(session, 7)).toHaveLength(0);
    expect(rscFramesUpTo(session, 8)).toHaveLength(1);
    expect(rscFramesUpTo(session, 11)).toHaveLength(2);
  });
  it("parses schema-valid ops from the first frame", () => {
    const ops = frameOps(rscFramesUpTo(session, 8)[0]);
    expect(ops.length).toBeGreaterThan(0);
    expect(ops[0].type).toBe("node-create");
  });
});

describe("causalChain", () => {
  it("extends as the tick advances", () => {
    const reached = (t: number) => causalChain(session, t).filter((n) => n.reached).length;
    expect(reached(0)).toBe(1); // user only
    expect(reached(6)).toBe(3); // user, action, cache
    expect(reached(11)).toBe(6); // all planes
  });
  it("carries each plane's latest event", () => {
    const action = causalChain(session, 11).find((n) => n.plane === "action");
    expect(action?.event?.phase).toBe("server-action:end");
  });
});
