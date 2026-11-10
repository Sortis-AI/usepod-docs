---
title: Pricing
description: Per-million-token pricing, the cap-at-centralized rule, and the fee split.
---

## Units

Prices are quoted **per million tokens**, separately for input and output. In the
API and headers, prices are expressed in **USDC microunits** (1 USDC =
1,000,000 microunits) — so `400000` means $0.40 per million tokens.

## The cap-at-centralized rule

Marketplace and key relay listings are **capped at the cheapest centralized price** for
the same model, on both the input and output axes. A provider can list below the
centralized price to win traffic, but never above it. Consequences:

- The marketplace is never more expensive than the centralized fallback.
- In auto routing, an over-priced listing simply loses to a cheaper option or to
  centralized.
- In marketplace-only routing, if every listing exceeds your ceiling, the request
  returns a no-provider-at-price result instead of overcharging.

## Fee split

Marketplace routes split each settled inference:

| Party | Share |
| --- | --- |
| Provider | 90% |
| Treasury | 10% |

Users are billed at the operator's listed (capped) price; the split is applied to
that amount at settlement.

## Billing basis

Billing is based on **actual token usage** extracted from the response stream, at
the price of the provider that served the request.

- **Centralized:** the serving provider's own published rates, including its
  cache-read and cache-write rates. OpenRouter-served requests bill at the cost
  OpenRouter reports for that request. If a request fails over to a pricier
  provider, it bills at that provider's rates, which is what you would pay that
  provider directly.
- **Marketplace and key relays:** the listing's rates. Cache reads and writes
  bill at the listing's own cache rates. A listing without them bills cache
  tokens at the cheapest cache rate any centralized provider publishes for the
  model, never above the listing's input rate, or at the input rate when no
  provider publishes one.

A missing cache price is never treated as free.
