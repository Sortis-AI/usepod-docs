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

The response contains your `<token>` and a USDC **deposit address**. The token is
what you place in the proxy base URL; the deposit address is where you send USDC
to fund it.

## After registering

1. **Fund** the token by card or USDC — see [Funding your balance](/using/funding/).
2. **Use** it as your base URL — see [Drop-in API](/using/drop-in-api/):

   ```bash
   ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude
   OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
   ```

The token must carry a positive balance before it can serve requests.
