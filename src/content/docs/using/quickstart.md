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

## Next steps

- [Drop-in API](/using/drop-in-api/) — exact base URLs and supported clients.
- [Spend controls](/using/spend-controls/) — cap the price you'll pay per model.
- [Funding your balance](/using/funding/) — card and USDC top-ups.
