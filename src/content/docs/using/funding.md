---
title: Funding your balance
description: Top up a token by card or by sending USDC on Solana.
---

A token carries a USDC-denominated balance. Each request is debited from it. You
can fund a token two ways.

## Card top-up

Open [`usepod.ai/fund`](https://usepod.ai/fund), choose **Card**, and pay with
an embedded Stripe Checkout. Card credits enter the same balance ledger as USDC
deposits. A small processing surcharge is added on top of the credit you choose.

## USDC deposit (Solana)

Send USDC to the deposit address returned when you
[registered your token](/api/register/). Deposits are detected on-chain and
credited to your balance automatically.

## Checking your balance

Every proxied response carries an `X-Balance-Remaining` header. You can also see
balance and transaction history in the dashboard at
[`usepod.ai/dashboard`](https://usepod.ai/dashboard).

## Notes

- Balance is debited per request based on actual token usage at the selected
  provider's price.
- Spending is gated on a positive balance; a token with a zero balance is
  rejected before any upstream call.
- To bound per-request cost, use [Spend controls](/using/spend-controls/).
