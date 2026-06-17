---
title: Inference proxy
description: The drop-in proxy path, supported endpoints, request headers, and response headers.
---

The proxy is the inference entry point. It mirrors the upstream OpenAI/Anthropic
API surface, with your token in the URL path.

Prefer to pay per request with no token at all? See
[Pay per request with x402](/api/x402-payments/).

## Path

```http
https://api.usepod.ai/proxy/<token>/...        # Anthropic-compatible
https://api.usepod.ai/proxy/<token>/v1/...     # OpenAI-compatible
```

Common endpoints behind the proxy:

| Endpoint | Surface |
| --- | --- |
| `/v1/chat/completions` | OpenAI chat completions (streaming and non-streaming) |
| `/v1/messages` | Anthropic messages |
| `/v1/models` | Model listing |

## Request headers

| Header | Required | Meaning |
| --- | --- | --- |
| `Content-Type: application/json` | yes | Standard JSON body |
| `X-Pod-Max-Price-Input` | no | Max price per million input tokens (USDC microunits) |
| `X-Pod-Max-Price-Output` | no | Max price per million output tokens (USDC microunits) |

The `Authorization` / `api_key` your SDK sends is ignored — auth is the token in
the path. See [Spend controls](/using/spend-controls/) for the price headers.

## Response headers

| Header | Meaning |
| --- | --- |
| `X-Balance-Remaining` | Remaining token balance after this request |
| `X-Pod-Route` | Which source served the request: marketplace, key relay, or centralized |

## Errors

- A token with **no balance** is rejected before any upstream call.
- An **unknown token** returns `401`.
- In marketplace-only mode, **no provider at your price** returns a dedicated
  no-provider result rather than billing at a higher price.

Streaming responses are relayed byte-for-byte from the selected source; token
usage is extracted from the stream for settlement.
