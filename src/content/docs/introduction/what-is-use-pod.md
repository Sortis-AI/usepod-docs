---
title: What is Use Pod
description: An inference marketplace with a drop-in OpenAI/Anthropic-compatible API and USDC settlement.
---

Use Pod is an **inference marketplace**. Independent operators run open-weight
models on their own GPU hardware — or relay requests with their own keys to
upstreams like Level5, Venice, OpenRouter, Together, Groq, or Morpheus — set
their prices, and earn USDC. Users send standard OpenAI- or Anthropic-compatible
API requests and get matched with the best-priced provider that meets their
requirements.

Centralized providers (Anthropic, OpenAI, Venice, Together, Groq, OpenRouter,
Bedrock) remain available as a **tier-zero fallback, always**. If no marketplace
provider can serve a request within your constraints, it transparently falls
through to a centralized upstream.

## Why it exists

Inference is becoming a commodity. A two-sided marketplace lets supply (anyone
with a GPU or an upstream key) meet demand (anyone with an OpenAI/Anthropic
client) directly, with price discovery instead of fixed list prices — while
keeping the drop-in compatibility that makes existing agents and tools work
unchanged.

## What makes it different

- **Drop-in compatibility.** Change one environment variable. No SDK changes, no
  auth changes. Existing OpenAI and Anthropic clients — including Claude Code,
  Cursor, and custom agents — work as-is.
- **USDC billing.** A token carries a balance; each request is debited. Top up
  by card or by sending USDC on Solana.
- **Open supply side.** Anyone can run the provider agent against a local backend
  (vLLM, llama.cpp, LM Studio, Ollama) or enroll a bring-your-own-key relay.
- **Price-capped routing.** Marketplace and BYOK candidates are never more
  expensive than the cheapest centralized price for the same model.

## Who it's for

- **Agent and app builders** who want cheaper inference without rewriting their
  integration.
- **GPU operators** who want to monetize spare capacity.
- **Resellers** who hold upstream API keys and want to set their own resale
  prices.

Next: [How it works](/introduction/how-it-works/).
