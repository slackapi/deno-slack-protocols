import { assertMatch } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  assertEquals,
  assertNotEquals,
  assertSpyCall,
  assertThrows,
  Spy,
  spy,
} from "./dev_deps.ts";
import {
  BaseProtocol,
  getProtocolInterface,
  MessageBoundaryProtocol,
} from "./mod.ts";

Deno.test("BaseProtocol", async (t) => {
  await t.step(
    "should return noop logging methods if manifest flag provided",
    () => {
      const prot = BaseProtocol(["--manifest"]);
      assertNotEquals(prot.log, console.log);
    },
  );
  await t.step(
    "should return standard console.log method if manifest flag absent",
    () => {
      const prot = BaseProtocol(["--nothingtoseehere"]);
      assertEquals(prot.log, console.log);
    },
  );
});

Deno.test("MessageBoundaryProtocol", async (t) => {
  await t.step("should throw if no boundary provided", () => {
    assertThrows(() => MessageBoundaryProtocol([]), Error, "no boundary");
  });
  await t.step(
    "should surround response messages with provided boundary",
    () => {
      const prot = MessageBoundaryProtocol(["--boundary=12345"]);
      const origLog = globalThis.console.log;
      globalThis.console.log = spy();
      const logSpy = globalThis.console.log as unknown as Spy;
      prot.respond("hiho");
      assertSpyCall(logSpy, 0, { args: ["12345hiho12345"] });
      globalThis.console.log = origLog;
    },
  );
  await t.step("should return a `getCLIFlags` method that returns correct --protocol and --boundary flags", () => {
    const providedFlags = ["--boundary=12345"];
    const prot = MessageBoundaryProtocol(providedFlags);
    const flags = prot.getCLIFlags();
    assertMatch(flags[0], /message-boundaries/);
    assertEquals(flags[1], providedFlags[0]); 
  });
});

Deno.test("getProtocolInterface()", async (t) => {
  await t.step(
    "should return BaseProtocol if no protocol provided as flag",
    () => {
      assertEquals(getProtocolInterface([]).name, "default");
    },
  );
  await t.step(
    "should return BaseProtocol if unrecognized protocol provided as flag",
    () => {
      assertEquals(
        getProtocolInterface(["--protocol=garbage"]).name,
        "default",
      );
    },
  );
  await t.step(
    "should return MessageBoundaryProtocol if message boundary protocol provided as flag",
    () => {
      assertEquals(
        getProtocolInterface([
          "--protocol=message-boundaries",
          "--boundary=123",
        ]).name,
        "message-boundaries",
      );
    },
  );
});
