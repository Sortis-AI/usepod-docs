---
title: Register a token
description: Create a token and deposit address with POST /v1/register.
---

Create a new token (with an associated USDC deposit address) by calling the
public register endpoint.

## Request

```http
POST https://api.usepod.ai/v1/register
```

No body or auth is required.

```bash
curl -X POST https://api.usepod.ai/v1/register
```

## Response

The response contains your `<token>` (the UUID you place in the proxy base
URL) and a `deposit_code` — a 16-hex-char string that binds an on-chain
USDC deposit to this token. The deposit goes to a single sovereign program;
the `deposit_code` is what tells the LiquidMirror which token's balance to
credit. Do not confuse it with the API token itself: the API token authorizes
inference calls, the `deposit_code` only authorizes inbound credit.

## After registering

1. **Fund** the token by card or USDC — see [Funding your balance](/using/funding/).
   To wire a deposit from a script or any wallet that signs custom transactions,
   see [Deposit on-chain](/api/deposit-on-chain/) for the instruction spec
   and JS + Python snippets.
2. **Use** it as your base URL — see [Drop-in API](/using/drop-in-api/):

   ```bash
   ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude
   OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
   ```

The token must carry a positive balance before it can serve requests.
