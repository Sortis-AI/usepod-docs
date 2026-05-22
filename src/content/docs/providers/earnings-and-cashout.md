---
title: Earnings & cashout
description: How provider earnings accrue and how to withdraw USDC to a Solana wallet.
---

## How you earn

Every settled marketplace inference credits your provider balance with **80% of
the billed amount**; the remaining 20% goes to the treasury. Earnings accrue per
request as the accounting worker settles usage — debiting the user and crediting
you in the same transaction.

Users are billed at your listed price, which is capped at the cheapest
centralized price for the model. For key relays, your upstream bill is still
yours to pay — price accordingly.

## Cashing out

Withdraw to a Solana wallet on demand from the cashout flow at
[`usepod.ai/host`](https://usepod.ai/host):

1. Request a withdrawal of an amount up to your available balance (subject to a
   minimum and a daily cap).
2. The payout worker builds, signs, and broadcasts a USDC transfer from the ops
   wallet to your destination.
3. The withdrawal is tracked through `requested → broadcast → confirmed`. Large
   withdrawals may require manual approval.

## Your bond

A **$50 USDC bond** is posted at enrollment and held while you operate. It backs
your reputation and is released after a cooldown window once you retire. Serious
misbehavior can result in a manual ban and bond seizure, with affected users
credited from a refund pool.

See [Trust & reputation](/marketplace/trust/) for how provider standing is
tracked.
