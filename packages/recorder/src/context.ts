import type { Session, TraceEvent } from "@flightrec/trace-schema";
import { AsyncLocalStorage } from "node:async_hooks";
import { createRecorder, type RecordInput, type Recorder, type RecorderOptions } from "./index";

const storage = new AsyncLocalStorage<Recorder>();

/** Run `fn` inside a fresh recording scope; returns its result plus the captured session. */
export async function runWithSession<T>(
  options: RecorderOptions,
  fn: () => T | Promise<T>,
): Promise<{ result: T; session: Session }> {
  const recorder = createRecorder(options);
  const result = await storage.run(recorder, fn);
  return { result, session: recorder.session() };
}

/** The recorder bound to the current async scope, or undefined when outside one. */
export function currentRecorder(): Recorder | undefined {
  return storage.getStore();
}

/** Record an event into the active scope; a safe no-op (returns undefined) outside any scope. */
export function recordEvent(input: RecordInput): TraceEvent | undefined {
  return storage.getStore()?.record(input);
}
