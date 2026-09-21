---
title: Aider
description: Run Aider against UsePod with two environment variables or two flags.
---

Aider reads the standard OpenAI environment variables, so it connects without a
configuration file.

## Setup

```bash
export OPENAI_API_KEY="UsePod"
export OPENAI_API_BASE="https://api.usepod.ai/proxy/<TOKEN>/v1"

aider --model gpt-5-4-mini
```

Replace `<TOKEN>` with the API token from your
[dashboard](https://usepod.ai/dashboard). Note that Aider uses
`OPENAI_API_BASE`, not `OPENAI_BASE_URL` — the two names appear
interchangeably across tools and are not.

Or pass everything as flags, which keeps a shared shell clean:

```bash
aider \
  --openai-api-key UsePod \
  --openai-api-base https://api.usepod.ai/proxy/<TOKEN>/v1 \
  --model gpt-5-4-mini
```

## Verify

Aider prints the active model on startup; confirm it matches what you asked for,
then send a one-line prompt. A reply means the proxy is carrying it.

## Choosing a model

Aider's editing formats ask a lot of a model — it expects diffs or whole files
back in a specific shape, and weaker models fail that structure more often than
they fail the reasoning. If edits are being rejected or malformed, try a
stronger model before assuming the integration is at fault.

`--model` accepts any id from the [marketplace](https://usepod.ai/marketplace).

## Troubleshooting

**Aider ignores the base URL.** The variable is `OPENAI_API_BASE`. Setting
`OPENAI_BASE_URL` does nothing here, which is a frequent cross-tool mix-up.

**Repeated malformed-edit retries.** A model-capability issue rather than a
connection one; the requests are arriving and being billed.

**402 mid-session.** Aider sends the repository map plus conversation on each
turn, so input tokens accumulate quickly on a large repo. Fund the token or
narrow the files in scope.
