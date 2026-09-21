---
title: Cursor
description: Override Cursor's OpenAI base URL to route its requests through UsePod.
---

Cursor keeps its model configuration in a settings panel rather than a file, so
this one is four clicks rather than a snippet.

## Setup

1. Open **Cursor → Settings → Models**.
2. Find **OpenAI API Key** and set it to any non-empty value — `UsePod` works.
3. Enable **Override OpenAI Base URL** and enter:
   `https://api.usepod.ai/proxy/<TOKEN>/v1`
4. Click **Verify**. Cursor pings the base URL and reports success.

Replace `<TOKEN>` with the API token from your
[dashboard](https://usepod.ai/dashboard).

Cursor stores these **per workspace**, which is a feature rather than a nuisance
once you notice it: a client project can carry its own token, and its inference
lands on its own balance without any further bookkeeping. It also means a fresh
workspace starts unconfigured, which is the usual explanation for a setup that
"stopped working" after switching projects.

## Verify

Open the chat panel and send a message. Cursor's own **Verify** button confirms
reachability but not billing; a real reply confirms both.

## What routes through UsePod and what does not

Cursor's chat and inline edits use the OpenAI-compatible endpoint you just
overrode, so those bill to your token. Some Cursor features — tab completion
among them — run on Cursor's own infrastructure and are unaffected by this
setting. If your balance moves more slowly than you expected, that is why.

## Troubleshooting

**Verify fails.** The base URL is missing the `/v1` suffix, or the token is
mistyped. Test the same URL with curl before touching Cursor's settings again.

**Verify passes but chat errors.** Usually a model id Cursor is requesting that
your account cannot reach. Check the [marketplace](https://usepod.ai/marketplace)
for the exact id.

**Settings vanished.** They are per workspace; reopen the workspace you
configured, or configure the new one.
