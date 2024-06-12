import type { Protocol } from "./types.ts";
import { spy } from "@std/testing/mock";

/**
 * A mock protocol constructor function, composed of purely spy functions, for use in testing.
 */
export const MockProtocol = function (): Protocol {
  return {
    name: "MockProtocol",
    log: spy(),
    warn: spy(),
    error: spy(),
    respond: spy(),
  };
};
