---
name: Local Ollama provider
description: Provider decision for running Ana Moslem with locally downloaded Qwen or Mistral models
---

The hospital host has Ollama installed, while the Qwen Code launcher is a separate cloud coding agent that can return a 429 monthly-usage error. Ana Moslem should use the host Ollama OpenAI-compatible endpoint and an explicitly configured `AI_MODEL` name rather than depending on the Qwen Code cloud quota.

**Why:** Local model downloads do not restore or increase a cloud agent's monthly quota, and using the local endpoint keeps normal companion conversations independent of that quota.

**How to apply:** Obtain the exact model name from `ollama list`, keep Ollama reachable from the Ana Moslem container on the private Docker/host network, and never expose port 11434 publicly.

The Replit development sandbox does not include SSH credentials, a remote Docker context, or a Portainer connection for the Ubuntu host, so host-side Ollama and stack checks must be run from that host or an explicitly connected deployment environment.

**Why:** Local compose validation cannot prove that the target host is listening or that a deployed container can reach it.

**How to apply:** Treat the repository’s compose checks as preflight only; require a target-host `/api/tags` check and an authenticated streamed `/api/chat` check before declaring the deployment operational.