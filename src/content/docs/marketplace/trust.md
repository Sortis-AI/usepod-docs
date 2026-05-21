---
title: Trust & reputation
description: Bonds, reputation scoring, and benchmark canaries that keep the marketplace honest.
---

The marketplace earns trust through mechanisms layered on top of price discovery
rather than upfront gatekeeping. Three are in place today.

## Bonds

Every provider posts a **$50 USDC bond** at enrollment, held while they operate.
Serious misbehavior can trigger a manual ban with bond seizure; affected users
are credited from a refund pool, with the treasury as backstop. The bond is
released after a cooldown once a provider retires in good standing.

## Reputation

Providers accrue a **reputation score** from request outcomes (successes,
failures, latency). Scores feed the sorted indices the coordinator uses for
selection, so reliable providers are favored when prices are comparable. Stale
providers (no recent heartbeat) are marked offline and excluded.

## Benchmark canaries

A small fraction of marketplace traffic (about **1%**) is sampled as a hidden
canary: a known prompt is substituted and the response is scored for deviation
from the expected output. Runs that deviate beyond a threshold are flagged, and a
sustained flag rate triggers manual review. This catches providers that
misreport the model they serve.

## What's deferred

Stronger guarantees — TEE attestation, content-addressed model registries,
on-chain stake/slashing, and a privacy layer — are on the roadmap but
intentionally deferred until marketplace traction justifies their complexity.
Today's stack is tokenizer-side counts, reputation, bonds, and canaries.
