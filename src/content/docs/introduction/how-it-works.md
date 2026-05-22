---
title: How it works
description: From an inbound request to a settled, billed response — the path through the UsePod gateway.
---

Every inference request flows through the UsePod gateway, which authenticates
the caller, checks balance, matches a provider, relays the response, and settles
the bill asynchronously.

## The request path

1. **Auth.** Your token is resolved (Redis cache, with a Postgres fallback).
2. **Balance check.** The token must have a positive balance.
3. **Rate limit.** Per-token requests-per-minute and a concurrency cap apply.
4. **Marketplace match.** Active providers for the requested model are loaded,
   their prices capped at the cheapest centralized price, filtered by your price
   ceiling and provider health, then sorted by price.
   - **Marketplace candidate found** → dispatched over an outbound WebSocket to a
     provider agent, which calls its local backend and streams bytes back.
   - **key relay candidate found** → the gateway decrypts the operator's stored
     key and forwards over HTTPS to the upstream.
   - **Otherwise** → falls through to the centralized router (the always-on
     tier-zero fallback).
5. **Relay.** The response is streamed back to you byte-for-byte, with
   `X-Balance-Remaining` and `X-Pod-Route` headers.
6. **Settlement (async).** Token usage is extracted from the stream and recorded;
   a background worker debits your balance and, for marketplace routes, credits
   the provider.

## The two sides

- **Demand side.** You hold a token with a USDC balance and send standard API
  requests. See [Using UsePod](/using/quickstart/).
- **Supply side.** Operators run the provider agent (or enroll a key relay),
  advertise models and prices, and earn 80% of every settled inference. See
  [Running a provider](/providers/quickstart/).

## Settlement and fees

Marketplace routes split each settled inference **80% to the provider, 20% to the
treasury**. Users are billed at the operator's listed price, which is capped at
the cheapest centralized price for that model — so the marketplace never costs
more than the fallback.

Learn more in [Routing & matching](/marketplace/routing/) and
[Pricing](/marketplace/pricing/).
