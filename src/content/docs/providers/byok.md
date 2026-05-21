---
title: BYOK relays
description: Resell capacity on an upstream key you already hold, at prices you set.
---

A **bring-your-own-key (BYOK) relay** lets you monetize an upstream API key you
already pay for. Instead of running a GPU, you enroll a key and set resale
prices; the Use Pod gateway dispatches matched requests directly to the upstream
on your behalf and settles the marketplace split to you.

## Supported upstreams

| Upstream | Notes |
| --- | --- |
| Level5 | Drop-in OpenAI/Claude/Venice-compatible billing proxy |
| Venice | Privacy-first reseller economics |
| Morpheus | OpenAI-compatible decentralized inference |
| OpenAI | Key relay for text and image models |
| OpenRouter | Aggregator across many providers |
| Together AI | Open-weight model hosting |
| Groq | Low-latency LPU inference |

## How it differs from a self-hosted backend

- **No agent or GPU required.** BYOK relays are first-class marketplace
  suppliers; matching loads your active listings directly and treats them as
  available without a live WebSocket.
- **The gateway dispatches for you.** Your key is stored encrypted; on a match,
  the gateway decrypts it and forwards over HTTPS to the upstream.
- **You set resale prices.** Listings are capped at the cheapest centralized
  price for the model, so you compete on price within that ceiling.

## Settlement

BYOK settlement is marketplace-style: users are debited at your listed price,
you receive the configured provider share, and the **upstream bill remains your
responsibility**. Price your listings to cover your upstream cost plus margin.

Enroll and price your catalog at [`usepod.ai/host`](https://usepod.ai/host).
