---
title: Pay per request with x402
description: Accountless, pay-as-you-go inference — pay each call with USDC or SOL on Solana, verified directly on-chain. No token, no API key.
---

Most of Use Pod runs on a prepaid token balance. **x402** is the accountless
alternative: no token, no API key, no signup — you pay for each request by
sending USDC (or native SOL) on Solana, and the gateway verifies the payment
**directly on-chain** before serving the call. There is no facilitator and no
intermediary holding your funds.

It is a good fit for agents and one-off automated callers that have a Solana
wallet but no Use Pod account.

## Endpoints

x402 has its own accountless proxy paths (no token in the URL):

```http
POST https://api.usepod.ai/proxy/x402/v1/chat/completions   # OpenAI-compatible
POST https://api.usepod.ai/proxy/x402/v1/messages           # Anthropic-compatible
```

Requests must include `max_tokens` (or `max_completion_tokens`) so the gateway
can quote a price ceiling. Text/chat only.

## The flow

x402 is a three-step exchange over standard HTTP headers:

1. **Quote** — send your request with no payment. The gateway replies `402
   Payment Required` with a `PAYMENT-REQUIRED` header: a base64-encoded JSON
   quote listing how you may pay.
2. **Pay** — send the quoted amount on-chain to the quote's `pay_to` address.
3. **Settle** — repeat the **identical** request with a `PAYMENT-SIGNATURE`
   header carrying your transaction signature. The gateway looks the transaction
   up on-chain, verifies it, and returns the completion plus a `PAYMENT-RESPONSE`
   receipt.

The request is bound to a hash of its method, path, and body, so step 3 must be
byte-for-byte identical to step 1 — serialize the body once and reuse it.

### The quote (`PAYMENT-REQUIRED`)

Base64-decode the header to JSON. `accepts` is a menu of payment options:

```json
{
  "x402_version": 2,
  "quote_id": "6982dfc8-a8f0-4429-8326-3e31251dec7c",
  "accepts": [
    {
      "asset": "USDC",
      "scheme": "exact",
      "network": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      "pay_to": "GXfqVnZENHzvim8rNN8TPwqxWXQe8EBbxhcEMYE8Z7BS",
      "amount_microunits": 44,
      "mode": "cap-with-surplus-credit"
    },
    { "asset": "SOL", "amount_microunits": 603, "pay_to": "GXfqVn…Z7BS", "...": "..." }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `quote_id` | Identifies this quote; echo it back in the payment signature |
| `asset` | `USDC` or `SOL` — pick one rail |
| `pay_to` | Solana address to send the payment to |
| `amount_microunits` | The amount to send: USDC microunits (6 dp) for the USDC rail, **lamports** for the SOL rail |
| `mode` | `cap-with-surplus-credit` — the amount is a cap (see below) |

The SOL rail is priced from a live SOL/USD rate at quote time, so its lamport
amount tracks the same dollar cap as the USDC rail. Both settle on Solana.

### The payment signature (`PAYMENT-SIGNATURE`)

After your on-chain payment confirms, build this JSON, base64-encode it, and send
it as the `PAYMENT-SIGNATURE` header on the retry:

```json
{
  "quote_id": "6982dfc8-a8f0-4429-8326-3e31251dec7c",
  "network": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "asset": "USDC",
  "payer_wallet": "<your wallet address>",
  "signature": "<the on-chain transaction signature>"
}
```

## What you're charged

The quoted amount is a **ceiling**, not the final price. The gateway charges
your actual token usage and credits the unused remainder (cap − actual) to a
wallet balance keyed to your `payer_wallet`, which is applied to future x402
requests from the same wallet. You always pay the cap up front on-chain; you
never overpay for the call itself.

## Verification & safety

- **Direct on-chain.** The gateway verifies your payment by reading the
  transaction from Solana (it never broadcasts on your behalf). For USDC it
  checks the token-balance delta into `pay_to`; for SOL, the native-balance
  delta. The payment must credit at least the quoted amount.
- **Solana only.** USDC and native SOL on Solana mainnet are supported today.
- **Replay-protected.** A given transaction signature can settle exactly one
  quote. Reusing it for a second quote is rejected.
- **Fees.** Your wallet pays the Solana network fee (~5,000 lamports) on top of
  the payment, so it needs a little SOL regardless of which rail you use.

## Worked example (Python)

A complete, runnable client for the USDC rail. It quotes, pays USDC on-chain
(waiting for confirmation), then settles — printing the model's reply.

```python
#!/usr/bin/env python3
"""Pay-per-call against the Use Pod API with x402 (USDC on Solana).

Deps: pip install requests==2.34.2 solana==0.36.12 solders==0.27.1
Env:  SOLANA_KEYPAIR (path to Solana keypair JSON), SOLANA_RPC_URL.
"""

import base64
import json
import os
import requests
from solana.rpc.api import Client
from solana.rpc.types import TxOpts
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import get_associated_token_address as ata

URL = "https://api.usepod.ai/proxy/x402/v1/chat/completions"
USDC = Pubkey.from_string("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
HDRS = {"Content-Type": "application/json", "User-Agent": "usepod-x402/1.0"}
body = json.dumps(
    {
        "model": "gpt-4o-mini",
        "max_tokens": 64,
        "messages": [{"role": "user", "content": "What is Solana?"}],
    }
)
kp = Keypair.from_bytes(
    bytes(json.load(open(os.path.expanduser(os.environ["SOLANA_KEYPAIR"]))))
)
token = Token(Client(os.environ["SOLANA_RPC_URL"]), USDC, TOKEN_PROGRAM_ID, kp)

# 1. Request with no payment -> 402 carrying a quote in the PAYMENT-REQUIRED header.
quote = json.loads(
    base64.b64decode(
        requests.post(URL, data=body, headers=HDRS).headers["PAYMENT-REQUIRED"]
    )
)
rail = next(r for r in quote["accepts"] if r["asset"] == "USDC")

# 2. Send the quoted USDC on-chain to the quote's pay_to address (waits for confirmation).
sig = token.transfer_checked(
    ata(kp.pubkey(), USDC),
    ata(Pubkey.from_string(rail["pay_to"]), USDC),
    kp,
    int(rail["amount_microunits"]),
    6,
    opts=TxOpts(skip_confirmation=False, preflight_commitment="confirmed"),
).value

# 3. Retry the identical request, proving payment with the transaction signature.
pay = base64.b64encode(
    json.dumps(
        {
            "quote_id": quote["quote_id"],
            "network": rail["network"],
            "asset": "USDC",
            "payer_wallet": str(kp.pubkey()),
            "signature": str(sig),
        }
    ).encode()
).decode()
resp = requests.post(URL, data=body, headers={**HDRS, "PAYMENT-SIGNATURE": pay})
print(resp.json()["choices"][0]["message"]["content"])
```

Run it:

```bash
pip install requests==2.34.2 solana==0.36.12 solders==0.27.1
export SOLANA_KEYPAIR=~/.config/solana/id.json
export SOLANA_RPC_URL="https://your-solana-rpc"   # any mainnet RPC
python x402_payment_demo.py
```

Your wallet needs a little SOL (for the network fee) and USDC (for the payment).
The per-call amounts are tiny — fractions of a cent — so a dollar of USDC covers
a great many calls.

## See also

- [Inference proxy](/api/proxy/) — the standard token-based proxy path
- [Funding your balance](/using/funding/) — prepaid card and USDC top-ups
- [Deposit on-chain](/api/deposit-on-chain/) — fund a token directly on Solana
