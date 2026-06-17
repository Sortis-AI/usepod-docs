---
title: Quickstart
description: Get a token, fund it, and point your client at UsePod in under a minute.
---

Add UsePod as the base URL of any OpenAI- or Anthropic-compatible client. No SDK
changes, no auth changes.

1. **Get a token and deposit address.**

   ```bash
   curl -X POST https://api.usepod.ai/v1/register
   ```

   The response includes your `<token>` and a USDC deposit address.

2. **Fund your balance.**

   Top up by card at [`usepod.ai/fund`](https://usepod.ai/fund) or send USDC to
   the deposit address. See [Funding your balance](/using/funding/).

3. **Point your client at UsePod.**

   ```bash
   # Anthropic-compatible (e.g. Claude Code)
   ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude

   # OpenAI-compatible (e.g. Cursor or the OpenAI SDK)
   OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
   ```

4. **Send requests as usual.**

   Your existing code is unchanged. Each request is debited from your balance,
   and responses carry an `X-Balance-Remaining` header.

## Walk through it in the dashboard

Prefer a UI to the API? The dashboard does the same three steps — register, fund,
connect — and hands you copy-paste client config.

**Your dashboard.** After you register, the dashboard shows your API token, a
ready-to-paste config for Claude Code / Codex / OpenAI / Cursor, your balance,
and recent activity. Save the bookmark URL it gives you to return later.

![The UsePod dashboard showing the API token, agent-connect snippets, balance chart, and activity feed.](/walkthroughs/dashboard.png)

**Add funds.** Open **Fund** and choose how to pay — card (Stripe), USDC on
Solana, or SOL swapped via Jupiter. Your dollar amount becomes a USDC balance
that each request draws down.

![The Fund page: pay by card, USDC on Solana, or SOL; preset amounts and a fee breakdown.](/walkthroughs/fund.png)

**Browse models and prices.** The Marketplace lists every model with its best
per-million input/output price, how many providers are online, and the
centralized fallback price.

![The Marketplace leaderboard: per-model best input/output prices, provider counts, and centralized fallback.](/walkthroughs/marketplace.png)

## Next steps

- [Drop-in API](/using/drop-in-api/) — exact base URLs and supported clients.
- [Spend controls](/using/spend-controls/) — cap the price you'll pay per model.
- [Funding your balance](/using/funding/) — card and USDC top-ups.
