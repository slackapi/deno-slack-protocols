import type { Protocol } from "./types.ts";
import { spy } from "@std/testing/mock";

export const MockProtocol = function (): Protocol {
  return {
    name: "MockProtocol",
    log: spy(),
    warn: spy(),
    error: spy(),
    respond: spy(),
  };
};
