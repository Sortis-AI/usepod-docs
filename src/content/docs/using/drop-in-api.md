---
title: Drop-in API
description: UsePod is a base-URL swap for any OpenAI- or Anthropic-compatible client.
---

UsePod's load-bearing promise is **drop-in compatibility**: you change one base
URL and nothing else. Your token lives in the URL path; your existing API calls,
SDKs, and tools work unchanged.

## Base URLs

| Client family | Base URL |
| --- | --- |
| Anthropic-compatible | `https://api.usepod.ai/proxy/<token>` |
| OpenAI-compatible | `https://api.usepod.ai/proxy/<token>/v1` |

The proxy path mirrors the upstream API surface, so `…/v1/chat/completions`,
`…/v1/messages`, `…/v1/models`, `…/v1/responses`, and streaming all behave as
the underlying provider does.

## Examples

```bash title="Claude Code"
ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude
```

```bash title="Cursor / OpenAI SDK"
OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
```

```python title="OpenAI Python SDK"
from openai import OpenAI

client = OpenAI(
    base_url="https://api.usepod.ai/proxy/<token>/v1",
    api_key="unused",  # auth is the token in the base URL
)

resp = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "hello"}],
)
print(resp.choices[0].message.content)
```

```toml title="Codex CLI (~/.codex/config.toml)"
model = "deepseek-v4-1-flash"
model_provider = "usepod"

[model_providers.usepod]
name = "UsePod"
base_url = "https://api.usepod.ai/proxy/<token>/v1"
wire_api = "responses"
```

Codex CLI only speaks the OpenAI Responses API and ignores `OPENAI_API_KEY` /
`OPENAI_BASE_URL`, so it needs this config file rather than the environment
variables above. No API key is required — the token in the URL authenticates.
Run `codex` after saving the file; any UsePod model id works as `model`. The
Responses endpoint is stateless (`previous_response_id` is rejected — Codex
resends history by default) and ignores hosted tools such as `web_search`;
streaming and tool calls both work.

## Response headers

Every proxied response includes:

- `X-Balance-Remaining` — your token's remaining balance after this request.
- `X-Pod-Route` — which path served the request (marketplace, key relay, or
  centralized fallback).

## Notes

- The `api_key` your SDK requires is ignored — authentication is the token in the
  base URL. Use any placeholder.
- Want to bound cost per request? See [Spend controls](/using/spend-controls/).
