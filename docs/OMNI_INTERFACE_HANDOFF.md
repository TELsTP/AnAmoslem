# Omni Interface — Living Handoff

## Purpose

The Omni Interface is the shared layer for the TELsTP ecosystem. It gathers the characters, assistants, and services from the different hubs into one place so they can share approved memories, learn from completed loops, and preserve continuity across experiences.

Ana Moslem is the spiritual and human-facing hub. It is not an isolated chatbot; it is one participant in the wider OmniCognitor/TELsTP ecosystem.

## Current local model

- Runtime: Ollama on the Ubuntu hospital server
- Confirmed local model: `qwen2.5:3b`
- Other installed local models: `mistral:latest`, `llama3.2:latest`
- Do not depend on `gemma4:31b-cloud` or Qwen Code cloud usage for normal local operation.
- The local model must not be exposed publicly.

## Character and memory roles

- **Noura** — cognitive, logical, and knowledge layer; source-of-truth coordinator for Ana Moslem.
- **Hayat** — creative, emotional, and life-guidance layer.
- **Muslim** — the integrating spiritual companion.
- **OmniCognitor** — wider nervous-system concept for connecting hubs and shared experiences.

Noura and Hayat should share an authenticated UnityContext containing identity, conversation continuity, goals, preferences, and approved memory. Memory must remain scoped to the authenticated Clerk user.

## Ana Moslem deployment

- Ana Moslem runs as a separate Docker/Portainer stack.
- The container listens on port `8000`.
- The Ubuntu host exposes it on port `8080` because Portainer already uses host ports `8000` and `9443`.
- The container connects to host-installed Ollama through the private Docker host gateway at port `11434`.
- Supabase remains the durable store for user-scoped conversations and approved memory after the pending migration is applied.

## Missing history import

This file is a project handoff summary, not a reconstruction of the previous 490-message Qwen conversation. Do not invent details that are not present here.

When the old conversation is exported as text or JSON, process it in stages:

1. Preserve the raw export privately and do not commit it if it contains credentials or personal data.
2. Extract decisions, stable identities, architecture, unresolved questions, and explicit user approvals.
3. Remove secrets, passwords, API keys, tokens, and unverified operational claims.
4. Store only the approved durable summary in a versioned memory document.
5. Feed that summary to local Qwen as context for the next Omni Interface iteration.

## Operating principle

Build continuity carefully: distinguish confirmed facts from proposals, distinguish local model capability from cloud-agent quota, and never grant an assistant authority to modify systems or claim live hospital data without explicit configured access.