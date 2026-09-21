---
title: OpenCode
description: Point OpenCode at UsePod with a provider block in opencode.json.
---

OpenCode reads its configuration from `opencode.json`, and the OpenAI provider
accepts a base URL override, so connecting it is a single block.

## Setup

Edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "openai": {
      "options": {
        "apiKey": "UsePod",
        "baseURL": "https://api.usepod.ai/proxy/<TOKEN>/v1"
      }
    }
  }
}
```

Replace `<TOKEN>` with the API token from your
[dashboard](https://usepod.ai/dashboard). `apiKey` can be any non-empty string;
the token in the URL is the credential, and the field exists only because the
SDK will not send a request without it.

A project-local `opencode.json` overrides the user-level one, which is the
cleanest way to bill separate work to separate tokens.

## Verify

Start OpenCode and send a message. A normal reply confirms the wiring; the model
picker will list whatever the OpenAI provider is configured to offer.

## Troubleshooting

**Connection refused or 404.** Check that `baseURL` ends in `/v1` — the
OpenAI-compatible surface takes the suffix.

**The model picker is empty.** OpenCode asks the provider for
`/v1/models`, which UsePod serves; an empty list usually means the base URL is
wrong rather than that the account has no access.

**402.** The token is out of balance. Fund it from
[the dashboard](https://usepod.ai/fund) and retry — nothing needs restarting.
