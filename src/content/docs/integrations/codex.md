---
title: Codex CLI
description: OpenAI's terminal coding agent needs a config file, not environment variables — here is the block that works and the behaviour to expect.
---

Codex is the one client on this list that cannot be wired with environment
variables, and the reason is worth understanding before you start: Codex ignores
`OPENAI_API_KEY` and `OPENAI_BASE_URL` outright, and since February 2026 it
speaks only the OpenAI **Responses** API — `wire_api = "chat"` is gone, and a
config that still sets it now refuses to load. Any instructions you find that
export two variables and run `codex` predate that change and will quietly send
your traffic to OpenAI instead.

UsePod serves `/v1/responses`, so the correct wiring is a provider block.

## Setup

Create or edit `~/.codex/config.toml`:

```toml
model = "deepseek-v4-1-flash"
model_provider = "usepod"

[model_providers.usepod]
name = "UsePod"
base_url = "https://api.usepod.ai/proxy/<TOKEN>/v1"
wire_api = "responses"
```

Then run `codex`. Replace `<TOKEN>` with the API token from your
[dashboard](https://usepod.ai/dashboard).

**No API key is required anywhere in this file.** With no `env_key` set, Codex
sends no `Authorization` header at all, and the token in the base URL is what
authenticates the request — so there is no secret to export and nothing to leak
into your shell history.

Set `wire_api` explicitly even though the documentation calls it the default;
configs that omitted it have been observed failing to reach the provider.

## Verify

Send a short prompt in the Codex TUI and watch the reply stream. Or confirm the
endpoint independently first:

```bash
curl -s https://api.usepod.ai/proxy/<TOKEN>/v1/responses \
  -H 'content-type: application/json' \
  -d '{"model":"deepseek-v4-1-flash","input":"Reply with exactly: ok",
       "max_output_tokens":200}'
```

A `"status": "completed"` response with an output item containing `ok` means the
surface is live for your token.

## Choosing a model

Any model id from the [marketplace](https://usepod.ai/marketplace) works in the
`model` field. One consequence is worth knowing, because it is invisible until
you hit it: **Codex decides which tools to offer the model based on the model
id**, matched against its own table of OpenAI names. Point it at an id it does
not recognise — which includes every non-OpenAI model — and two things change.

It prints a startup warning:

```
warning: Model metadata for `deepseek-v4-1-flash` not found.
Defaulting to fallback metadata; this can degrade performance and cause issues.
```

That warning is about Codex's local assumptions, not about UsePod rejecting
anything; your requests route normally. It means Codex is guessing at the
context window rather than reading it from a table, so it may compact the
conversation earlier than necessary.

And it omits the `apply_patch` tool, offering a sub-agent namespace instead.
Codex still edits files — it falls back to shell commands through
`exec_command` — but multi-file edits go through a less structured path than
they would on a model it recognises.

Neither behaviour breaks the integration. If you would rather have the patch
tool, name a model Codex knows; if you would rather have the price, name the
model you want and accept the warning.

## What the Responses surface supports

- **Streaming and tool calls** both work, including multi-turn tool loops.
- **Reasoning** is passed through: models that emit reasoning content surface it
  as a reasoning item alongside the message.
- **It is stateless.** `previous_response_id` is rejected with a 400, because
  UsePod stores no responses. Codex sends `store: false` and resends the full
  conversation each turn, so this never comes up in normal use.
- **Hosted tools are ignored.** `web_search` and `tool_search` have no
  equivalent on a chat-completions upstream and are dropped rather than
  forwarded, which is what keeps upstreams from rejecting the whole request.

## Troubleshooting

**`wire_api = "chat"` is no longer supported.** Delete the line or set it to
`"responses"`. Chat-completions support was removed from Codex in early 2026.

**Requests go to api.openai.com.** Your provider block is not being used —
usually a missing `model_provider = "usepod"` at the top level, or a
`[model_providers.…]` table whose name does not match it.

**404 on `/v1/responses`.** The base URL is missing its `/v1` suffix. Unlike the
Anthropic surface, this one takes it.

**The startup metadata warning.** Expected on any non-OpenAI model id. See
above; it is not an error.
