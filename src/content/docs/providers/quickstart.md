---
title: Provider quickstart
description: Install the agent, enroll, post a bond, and start earning USDC for served inference.
---

Run a GPU? Earn USDC by serving inference. Point the provider agent at a local
backend (vLLM, llama.cpp, LM Studio, Ollama) — or resell an upstream key you
already pay for — and set your resale prices.

1. **Install the agent.**

   ```bash
   curl https://usepod.ai/install.sh | sh
   ```

   On Windows: `irm https://usepod.ai/install.ps1 | iex`.

2. **Enroll.**

   ```bash
   usepod-agent enroll          # prints an enrollment code
   ```

   Paste the enrollment code at [`usepod.ai/host`](https://usepod.ai/host).

3. **Post a bond.**

   Send the displayed **$50 USDC** bond to the deposit address. The bond is held
   while you operate and released after a cooldown when you retire.

4. **Run.**

   ```bash
   usepod-agent run
   ```

   The agent opens an outbound WebSocket to the coordinator, advertises your
   models and prices, and starts receiving jobs.

You earn **80% of every settled inference**. Withdraw to a Solana wallet on
demand — see [Earnings & cashout](/providers/earnings-and-cashout/).

## Two ways to supply

- **Self-hosted backend.** The agent dispatches jobs to your local inference
  server. See [The provider agent](/providers/agent/).
- **Resell a key.** Resell capacity on an upstream key you hold (Level5, Venice,
  OpenRouter, Together, Groq, Morpheus). See [Resell your keys](/providers/resell-keys/).
