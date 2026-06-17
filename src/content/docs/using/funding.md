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

The dashboard at [`usepod.ai/fund`](https://usepod.ai/fund) handles this end
to end — connect a wallet, choose USDC, approve. Behind the scenes it sends
a `DepositUsdc` instruction to the sovereign program with your token's
`deposit_code` embedded, and the LiquidMirror credits your balance within
seconds of finalization.

To deposit from a script or a wallet that signs custom transactions, build
the instruction yourself — see [Deposit on-chain](/api/deposit-on-chain/)
for the full spec and ready-to-paste JS + Python snippets. **A plain SPL
USDC transfer with a memo will NOT be credited** — the binding to your
token lives inside the instruction data, not in a separate memo.

## No account: pay per request

If you'd rather not hold a balance at all, [x402](/api/x402-payments/) lets you
pay for each request individually by sending USDC or SOL on Solana — no token, no
top-up. It suits agents and one-off automated callers with a Solana wallet.

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
