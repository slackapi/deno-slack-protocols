import { parseArgs } from "@std/cli/parse-args";
import type { Protocol } from "./types.ts";

// List of slack-cli communication protocols supported
const DEFAULT_PROTOCOL = "default";
const MSG_BOUNDARY_PROTOCOL = "message-boundaries";
const SUPPORTED_NAMED_PROTOCOLS = [
  MSG_BOUNDARY_PROTOCOL,
];

/**
 * The baseline CLI<=> SDK protocol: all hook responses from this project go to stdout,
 * and the CLI reads both stdout and stderr and combines them to interpret the hook response.
 * This simplistic protocol has inherent limitations: cannot log diagnostic info!
 * @param args command-line arguments passed to this process
 */
export const BaseProtocol = function (args: string[]): Protocol {
  const { manifest: manifestOnly = false } = parseArgs(args);
  // If the particular hook invocation is requesting for manifest generation, we ensure any logging is a no-op,
  // so as to not litter stdout with logging - and confuse the CLI's manifest JSON payload parsing.
  const loggerMethod = manifestOnly ? () => {} : console.log;
  return {
    name: DEFAULT_PROTOCOL,
    log: loggerMethod,
    error: loggerMethod,
    warn: loggerMethod,
    respond: console.log,
  };
};

/**
 * Protocol implementation that only uses stdout, but uses message boundaries to differentiate between
 * diagnostic information and hook responses.
 * @param args command-line arguments passed to this process
 */
export const MessageBoundaryProtocol = function (
  args: string[],
): Required<Pick<Protocol, "getCLIFlags">> & Protocol {
  const { boundary } = parseArgs(
    args,
  );
  if (!boundary) throw new Error("no boundary argument provided!");
  const protocol = {
    name: MSG_BOUNDARY_PROTOCOL,
    log: console.log,
    error: console.error,
    warn: console.warn,
    // deno-lint-ignore no-explicit-any
    respond: (data: any) => {
      console.log(boundary + data + boundary);
    },
    getCLIFlags:
      () => [`--protocol=${MSG_BOUNDARY_PROTOCOL}`, `--boundary=${boundary}`],
  };
  return protocol;
};

// A map of protocol names to protocol implementations
const PROTOCOL_MAP = {
  [SUPPORTED_NAMED_PROTOCOLS[0]]: MessageBoundaryProtocol,
};

/**
 * Based on the arguments provided by the CLI to the SDK hook process, returns an appropriate Protocol interface
 * for communicating with the CLI over the specified protocol.
 * @param args string[] An array of strings representing the command-line flags/arguments passed to the hook
 */
export const getProtocolInterface = function (args: string[]): Protocol {
  const { protocol: protocolRequestedByCLI } = parseArgs(
    args,
  );
  if (protocolRequestedByCLI) {
    if (SUPPORTED_NAMED_PROTOCOLS.includes(protocolRequestedByCLI)) {
      const iface = PROTOCOL_MAP[protocolRequestedByCLI];
      // Allow support for protocol implementations to either be:
      // - a function, that takes arguments passed to this process, to dynamically instantiate a Protocol interface
      // - an object implementing the Protocol interface directly
      if (typeof iface === "function") {
        return iface(args);
      } else {
        return iface;
      }
    }
  }
  // If protocol negotiation fails for any reason, return the base protocol
  // In the base protocol, if only a manifest is being requested, then we must
  // return the manifest JSON over stdout, so the logging interface passed into
  // BaseProtocol is a no-op function (to prevent logging to stdout)
  return BaseProtocol(args);
};
