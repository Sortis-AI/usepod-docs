---
title: Spend controls
description: Cap the price you'll pay per million tokens with per-request headers.
---

You can bound the price you're willing to pay on a per-request basis with two
optional headers. If no provider (marketplace, BYOK, or centralized) can serve
the request at or below your ceiling, the request is rejected rather than billed
at a higher price.

## Price-ceiling headers

| Header | Meaning |
| --- | --- |
| `X-Pod-Max-Price-Input` | Max price per **million input tokens**, in USDC microunits |
| `X-Pod-Max-Price-Output` | Max price per **million output tokens**, in USDC microunits |

Prices are expressed in **USDC microunits** (1 USDC = 1,000,000 microunits).

```bash title="Cap at $0.40/M input and $0.60/M output"
curl https://api.usepod.ai/proxy/<token>/v1/chat/completions \
  -H "content-type: application/json" \
  -H "X-Pod-Max-Price-Input: 400000" \
  -H "X-Pod-Max-Price-Output: 600000" \
  -d '{"model":"gpt-5.5","messages":[{"role":"user","content":"hi"}]}'
```

## How ceilings interact with routing

- A candidate is eligible only if **both** its input and output prices are at or
  below your ceilings.
- Marketplace and BYOK prices are already capped at the cheapest centralized
  price for the model, so your ceiling filters within that capped set.
- In `auto` routing, a too-expensive marketplace listing simply falls through to
  a cheaper option (or to centralized). In marketplace-only routing, it returns a
  no-provider-at-price result instead of overcharging.

See [Routing & matching](/marketplace/routing/) for the full selection order.
