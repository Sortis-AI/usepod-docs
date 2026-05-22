---
title: Verification is the product
description: Once you can cryptographically verify which model ran on which hardware, compute stops being a service and becomes a tradable commodity — with a futures market on top.
---

:::note[Adapted from an essay]
Adapted from a piece originally published on X by [@0xgilbert](https://x.com/0xgilbert/status/2055997978473574591), 2026-05-17. Lightly edited for the docs.
:::

:::caution[Vision, not shipped]
This page describes where Use Pod is headed, not what it does today. Hardware
attestation and compute futures are roadmap items. For the trust mechanisms that
are live now (reputation, benchmark canaries, bonds), see
[Trust & reputation](/marketplace/trust/).
:::

## The inference black box

When you send a prompt to a frontier model, you're trusting the provider on three
things you can't check: that you're actually talking to the model you asked for,
that its quantization and weights haven't changed since last month, and that the
hardware running your request matches the performance you built your workflow
around.

The API responds, you get tokens, you pay the bill — but the whole transaction
happens inside a box you can't inspect or audit. When stakes are low, trust works
fine. As workloads move from "write a blog post" to "execute a trading strategy"
or "process protected health information," trust stops being enough.

## You're not buying a model — you're buying compute

When you request inference, you're implicitly buying access to specific hardware,
for a specific duration, at a specific performance level. Build a workflow
assuming sub-200ms p99 because you tested on current-gen GPUs, and if a provider
quietly shifts you to older hardware at peak, your application degrades — with no
recourse, because you have no proof it happened.

Extend that to training: you're not buying "run this model," you're buying "give
me 8 of this GPU in this region for a week." The gap between getting exactly that
and getting something slower elsewhere is the difference between a run that
converges on schedule and one that blows its budget.

## Attestation unlocks a compute market

Once you can cryptographically verify that you received specific hardware, in a
specific location, for a specific duration, at a specific performance level,
compute stops being a service and starts being a commodity. And commodities have
futures markets.

If you know you'll need a block of GPU-hours next quarter, why not lock in that
capacity today at today's price? If delivery can be *proven* through attestation,
compute becomes as tradable as oil, wheat, or treasury bonds. Datacenters benefit
symmetrically: they carry utilization risk, and selling futures against capacity
lets them lock in guaranteed buyers and fund the next buildout with future
revenue.

## Liquid compute futures

In a verifiable market, a dated block of regional GPU capacity becomes a tradable
instrument. You don't bid on bespoke requests — you buy standardized contracts:
fixed units (GPU-hours), fixed regions, fixed delivery windows, fixed attestation
requirements. The contract trades on an exchange, market makers provide
liquidity, and if your schedule slips you sell it on. Capacity stops being a
procurement problem and becomes a position you manage.

## Why standardization matters

Bespoke contracts don't scale — every negotiation is custom, there's no benchmark
price, no liquidity, no way to hedge. Standardized contracts are fungible: your
June capacity is identical to mine, so we can trade. Once contracts are fungible,
derivatives emerge — options on capacity, spreads between regions, volatility
indices. Deep markets let you move size without moving price.

## Settlement is the unlock

Commodity futures only work if settlement is instant, trustless, and cheap.
Traditional clearinghouses add cost, delay, and counterparty risk. Verifiable
compute doesn't need one: attestation proves delivery, a smart contract verifies
the proof, and payment releases atomically on-chain. You submit a report proving
you delivered the contracted capacity; the contract checks the signature,
hardware proof, location, and timing; payment settles — no intermediary, no
multi-day hold.

Standardized contracts, verifiable delivery, and atomic settlement together turn
compute into a liquid commodity that clears like crude oil or wheat — but settles
faster than a card transaction.
