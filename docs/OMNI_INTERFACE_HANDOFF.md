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

## History import record

The workspace audit on 2026-09-05 did not find a machine-readable export of the
previous 490-message Qwen/Omni conversation. The only large candidate was a
580-page scanned Arabic reference book, confirmed by visual page inspection and
excluded. The shorter Noura/Hayat PDFs are design and conversation reference
documents, not the requested export; they contain private dialogue and
unverified strategic claims, so they were not imported as confirmed history.
No raw transcript was copied into the repository or loaded as model context.

The following is the approved durable summary from the current project state:

- Ana Moslem is the spiritual and human-facing hub within the wider Omni/TELsTP
  concept; it should remain a participant in that ecosystem rather than claim
  access to every connected system.
- Noura is the knowledge and logic layer, Hayat is the creative and life-guidance
  layer, and Muslim is the integrating spiritual companion. These are product
  roles, not independent authorization identities.
- UnityContext is a proposed shared context boundary for authenticated identity,
  continuity, goals, preferences, and approved memory. It must remain scoped to
  the authenticated Clerk user.
- Conversation and approved memory persistence is server-mediated through
  Supabase. The server verifies Clerk identity before using its service-role
  connection; no public client policy is the intended security boundary.
- The local runtime decision is Ollama on the Ubuntu host, using the confirmed
  `qwen2.5:3b` model through the private Docker host gateway. The container is
  exposed on host port `8080`, listens internally on `8000`, and Ollama must not
  be exposed publicly.
- The Architect handshake is not an authorization grant. It can only activate a
  session that is already allowlisted or provisioned server-side.

### Still unresolved

- The actual 490-message export must be supplied as text or JSON before any
  transcript-specific decisions, approvals, or chronology can be claimed.
- The authenticated Supabase memory migration remains a deployment prerequisite;
  its completion must be verified independently.
- Exact model availability and private host networking must be checked on the
  target Ubuntu host before treating local Qwen as operational.
- Claims in imported design material about live hospital systems, operational
  metrics, project scale, funding, or future deployments remain proposals unless
  separately verified through configured access.

When the old conversation is eventually supplied, process it in stages:

1. Keep the raw export private and do not commit it.
2. Extract decisions, stable identities, architecture, unresolved questions,
   and explicit user approvals without loading the full transcript into context.
3. Remove secrets, passwords, API keys, tokens, personal identifiers, and
   unverified operational claims.
4. Record only the approved durable summary with source and confidence notes.
5. Feed that summary to local Qwen as context for the next Omni iteration.

## Operating principle

Build continuity carefully: distinguish confirmed facts from proposals, distinguish local model capability from cloud-agent quota, and never grant an assistant authority to modify systems or claim live hospital data without explicit configured access.