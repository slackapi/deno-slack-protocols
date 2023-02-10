# deno-slack-protocols

This library is a utility for use by Slack's next-generation application platform, focused on remixable
units of functionality encapsulated as ephemeral functions. It implements the rules for communication (i.e. the protocol)
between [Slack CLI][cli] and any Slack app development SDKs.

This is separate from the [deno-slack-hooks][hooks] project, which implements the various APIs encapsulating
work delegation from the CLI to the SDK. The [deno-slack-hooks][hooks] project implements the API, which uses this
library under the hood.

## Requirements

This library requires a recent (at least 1.22) version of [deno](https://deno.land).

## Running Tests

If you make changes to this repo, or just want to make sure things are working as desired, you can run:

    deno task test

To get a full test coverage report, run:

    deno task coverage

---

### Getting Help

We welcome contributions from everyone! Please check out our
[Contributor's Guide](.github/CONTRIBUTING.md) for how to contribute in a
helpful and collaborative way.

[cli]: https://github.com/slackapi/slack-cli
[hooks]: https://github.com/slackapi/deno-slack-hooks