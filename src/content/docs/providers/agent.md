---
title: The provider agent
description: How the standalone agent connects, advertises capabilities, and serves jobs from your local backend.
---

The provider agent (`usepod-agent`) is a small standalone binary that connects
your inference hardware to the UsePod coordinator. It is open source so
operators can audit exactly what they run.

## Supported backends

The agent discovers and dispatches to local OpenAI-compatible backends:

| Backend | Default port |
| --- | --- |
| vLLM | `8000` |
| llama.cpp server | `8080` |
| LM Studio | `1234` |
| Ollama | `11434` |

## Lifecycle

1. **Identity.** On first run the agent generates an Ed25519 keypair, persisted
   locally with `0600` permissions. This key is your provider identity.
2. **Connect.** The agent dials an **outbound** WebSocket to the coordinator
   (`wss://api.usepod.ai/provider/connect`). No inbound ports are required.
3. **Authenticate.** A signed challenge/response binds the connection to your
   provider record (enrolling on first connect via the enrollment code).
4. **Advertise.** The agent sends a `capabilities` message — your models, prices,
   max concurrency, and backend kind — which the coordinator records and marks
   you online.
5. **Serve.** The coordinator dispatches jobs; the agent calls your local
   backend and streams the response bytes back. Heartbeats keep your health and
   metrics fresh.

## Reconnection

If the connection drops — for example during a coordinator deploy — the agent
reconnects automatically with backoff and re-advertises its capabilities. A
clean coordinator shutdown sends a close frame so the agent treats it as a
planned cycle rather than an outage.

## Keeping current

Existing hosts do not update automatically. To upgrade:

```bash
usepod-agent upgrade
sudo systemctl restart usepod-agent   # or restart your process manager
usepod-agent version
```
