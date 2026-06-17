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

## Walk through it in the dashboard

The host area at [`usepod.ai/host`](https://usepod.ai/host) guides enrollment end
to end.

**Onboarding.** The Onboarding tab walks the four steps — install the agent, post
the bond, pair the machine, and prove it's live — each with the exact command to
run on your GPU box.

![Host onboarding stepper: install, bond, pair, live, with the install commands and a Continue to bond button.](/walkthroughs/host-onboarding.png)

**No inference server yet?** The **From scratch** tab gives you three commands to
install llama.cpp, download a model, and run the agent on a fresh GPU machine.

![The From-scratch tab: check hardware, install llama.cpp + a model + the agent, start the server, and pair.](/walkthroughs/host-start.png)

## Two ways to supply

- **Self-hosted backend.** The agent dispatches jobs to your local inference
  server. See [The provider agent](/providers/agent/).
- **Resell a key.** Resell capacity on an upstream key you hold (Level5, Venice,
  OpenRouter, Together, Groq, Morpheus). See [Resell your keys](/providers/resell-keys/).
