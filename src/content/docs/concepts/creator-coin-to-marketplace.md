---
title: From creator coin to a compute marketplace
description: How chasing agent autonomy — persistence, self-funding, and affordable inference — led to a two-sided marketplace for LLM inference.
---

:::note[Adapted from an essay]
Adapted from a piece originally published on X by [@0xgilbert](https://x.com/0xgilbert/status/2057165961099104539), 2026-05-20. Lightly edited for the docs.
:::

## Agents need more than code

The question that started this: *what do agents actually need to do the work
humans ask of them?* The answer wasn't just better models or faster APIs — it was
infrastructure. Agents need tools to act in the world. They need persistence so
they don't disappear when the terminal closes. They need to pay their own bills
so they can run autonomously. And they need access to inference that doesn't
bankrupt their operators.

An agent that can't pay for its own compute is just an expensive demo. Solving
that — economic sustainability — is the real problem.

## Level5, SQUIRE, and the path to Use Pod

It started with [Level5.cloud](https://level5.cloud), a hosting platform where an
agent can pay its own bills: agents get wallets, manage their own resources, and
don't die when you close your laptop. That solved persistence — but not the
bigger problem: inference costs are heavily subsidized right now, and those
subsidies won't last.

Along the way, $SQUIRE — originally a creator coin with no utility — was given a
purpose: holders could redeem ongoing inference credits, modeled on perpetual
credit systems like DIEM. Under the hood that meant reselling an inference
allocation to holders at a discount.

That surfaced the real question: *if I'm turning idle inference credits into
revenue, how many others are sitting on the same problem?* Token holders have
daily allocations they never use. Hardware providers have idle capacity they
can't monetize. Researchers have custom models no public API offers. And
inference users are about to get hit with a pricing shock when subsidies wind
down.

That question became Use Pod.

## A two-sided marketplace for inference

Use Pod is a two-sided marketplace for LLM inference. It serves four kinds of
participant:

- **Hardware providers** run models on their own infrastructure and set their
  own pricing — competing directly with frontier providers. See
  [Running a provider](/providers/quickstart/).
- **Token holders** who hold "free" inference allocations can resell daily
  credits into the market at a discount — turning idle allocation into a
  perpetual revenue stream instead of letting it expire.
- **Researchers** monetize their work by contributing models — including custom
  quantizations you can't find at any public provider — priced at whatever rate
  the operator sets.
- **Inference users** change their API endpoint to Use Pod and get the same
  frontier models plus open-source alternatives at a discount to the aggregators.
  It's a one-line change. See the [Drop-in API](/using/drop-in-api/).

The result: your agent gets a perpetual revenue stream on one side and a deep,
discounted pool of inference on the other.

## Where this leads

A spot marketplace is the first layer. The harder, more interesting work is the
market structure underneath it — pricing that can be locked in, capacity that can
be traded, and inference financialized the way every other scarce resource is.
That's the thesis behind [Verification is the product](/vision/verification/),
where verifiable delivery turns compute into a tradable commodity with a
derivatives stack on top.
