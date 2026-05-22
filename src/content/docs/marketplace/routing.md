---
title: Routing & matching
description: How the coordinator selects a provider for each request, with centralized fallback.
---

For each request, the coordinator selects where to send it. The goal is the
cheapest source that satisfies your model, price, and health constraints — with a
centralized provider always available as a fallback.

## Selection order

1. **Load candidates** for the requested model: active marketplace providers
   (live agents that are online and healthy) and active key relay listings.
2. **Cap prices** at the cheapest centralized price for the model, on both the
   input and output axes.
3. **Filter** by your per-request price ceiling (see
   [Spend controls](/using/spend-controls/)), throttle, and capacity/health.
4. **Sort** by listed price and pick the best.

If a marketplace or key relay candidate is selected, the request is dispatched to it.
Otherwise it **falls through to the centralized router** — the always-on
tier-zero fallback (Anthropic, OpenAI, Venice, Together, Groq, OpenRouter,
Bedrock).

## Routing modes

- **Auto (default).** Prefer the cheapest eligible marketplace/key relay candidate;
  fall through to centralized when none qualifies.
- **Marketplace-only.** Restrict to marketplace/key relay candidates; if none qualify
  at your price, return a no-provider-at-price result rather than using
  centralized.

## Why fallback is always on

Drop-in compatibility is the load-bearing promise: clients must never break
because the marketplace is thin for a given model at a given moment. Centralized
fallback guarantees a request can always be served, so the marketplace can grow
density without stranding users.

The `X-Pod-Route` response header tells you which path served each request.
