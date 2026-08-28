# Reading Progress Sync via OAuth — Design Spec

**Date:** 2026-08-28
**Status:** Approved by Gavin (in-chat, experience-level design)
**Path:** Architectural (new auth + storage subsystem)
**Builds on:** `2026-08-26-reading-guides-design.md`

## Purpose

Reading-checklist progress currently lives in one browser's localStorage.
Gavin wants it to follow him across devices. Decision (over anonymous sync
codes): lightweight **OAuth sign-in with Google and Discord**, because a real
identity is also the prerequisite for the planned Hardcover integration.
Facebook explicitly dropped (business-verification burden, no audience).

Privacy stance — and the page says so on a hover ⓘ: we keep **only an opaque
provider user-ID** (`google:<sub>` / `discord:<id>`). Minimal scopes
(`openid` for Google, `identify` for Discord) mean no email is requested;
whatever transient profile fields a provider returns are never stored.

## Experience

- Progress bar gains **"Sign in to sync"** → small popover with a Google and
  a Discord button + the ⓘ privacy note. Full-page redirect flow, lands back
  on the guide page.
- Signed in: popover shows "Syncing ✓ · via Google · Sign out". Every tick
  saves to the cloud (debounced); opening the guide on another signed-in
  device shows the same ticks.
- **First sign-in on a device merges** (union) local ticks with cloud ticks —
  nothing is lost. Afterwards the cloud is the source of truth on page load;
  last write wins across devices (fine for one human).
- Signed out / never signed in: exactly today's behavior (localStorage only).
  localStorage always remains the local cache so the page renders instantly.

## Architecture

### Auth: hand-rolled minimal OAuth (no new dependencies)

Auth.js/next-auth is NOT used: its Next-16 + OpenNext-on-Workers
compatibility is unproven and we need none of its surface (no adapters, no
user DB, no profile handling). Instead, ~200 lines of well-trodden
authorization-code + PKCE + `state` flow on App Router route handlers,
Workers-native via WebCrypto:

- `GET /api/auth/login/[provider]?from=<same-origin path>` — sets a short-lived
  HttpOnly cookie carrying `{state, pkceVerifier, from}` (HMAC-signed), 302 to
  the provider's authorize URL.
- `GET /api/auth/callback/[provider]` — verifies `state`, exchanges the code
  (server-side fetch with client secret + PKCE verifier). Google: read `sub`
  from the returned `id_token` payload (direct-TLS from Google, no JWKS
  verification needed). Discord: `GET /users/@me` with the access token, read
  `id`. Sets the session cookie, 302 back to `from` (validated: relative,
  same-origin).
- `POST /api/auth/logout` — clears the cookie.
- `GET /api/auth/session` — `{ signedIn: boolean, provider?: "google"|"discord" }`.
  Never exposes the user id to the client.

**Session cookie** `nerdz_session`: `base64url(json{uid,iat,exp}).hmac` signed
with `AUTH_SECRET` (WebCrypto HMAC-SHA256). HttpOnly, Secure, SameSite=Lax,
Path=/, Max-Age 180 days. `uid` is `provider:id`.

**Secrets** (Worker secrets via `wrangler secret put`, persist across CI
deploys; `.dev.vars` gitignored for local dev): `AUTH_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`,
`DISCORD_CLIENT_SECRET`.

**Callback URLs** registered with providers:
`https://nerdz.cloud/api/auth/callback/{google,discord}` plus the
`http://localhost:3000` twins for dev.

### Storage: Cloudflare KV

- Namespace bound as `READING_SYNC` in `wrangler.jsonc` (created once via
  wrangler; account: nerdz). Free tier is ample.
- Key `progress:<uid>:<guideSlug>` → `{ v: 1, checked: string[], updatedAt }`.
- KV's eventual consistency (~60s cross-edge) is acceptable: same-device
  reads come from localStorage, cross-device switches are minutes apart.

### Progress API

- `GET /api/reading/progress?guide=<slug>` — 401 without session; else the
  stored record or `{v:1, checked:[]}`.
- `PUT /api/reading/progress?guide=<slug>` — 401 without session; body zod-
  validated: known guide slug, `checked` ⊆ that guide's item ids (unknown ids
  dropped), payload capped. Writes with `updatedAt`.
- Bindings via `getCloudflareContext()` (`@opennextjs/cloudflare`) in route
  handlers; local dev gets KV emulation through the same call (miniflare).

### Client (`ReadingGuide.tsx` + a small `SyncControl` component)

- On mount: `GET /api/auth/session`. If signed in → `GET` progress; if this
  device hasn't synced this guide before (localStorage flag
  `nerdz.reading.synced.<slug>`), union local+remote and `PUT` the result;
  else adopt remote. Store flag.
- Each toggle: optimistic local update + debounced (600ms) `PUT`.
- Failures degrade silently to local-only (indicator shows "offline" state);
  next successful load re-syncs.
- Popover UI + ⓘ tooltip text:
  > "Signing in only gives us an anonymous account number so your reading
  > progress can follow you between devices. No name, no email, nothing else
  > is collected or shared."

## Security notes

- `state` + PKCE on both providers; login/state cookie is HMAC-signed and
  short-lived (10 min).
- Redirect target restricted to same-origin relative paths.
- Progress payloads validated against the guide's known item ids and capped —
  KV can't be used as arbitrary storage.
- Session cookie is HttpOnly; the client JS never sees ids or tokens.
- Provider tokens are used once during the callback and discarded — never
  stored.

## Verification

- `npm run lint`, `npm run build`.
- Pre-credentials: session-cookie sign/verify and 401 paths exercised against
  the dev server; full provider round-trip is only testable once the OAuth
  apps exist.
- Post-credentials (after the console walkthrough): live end-to-end — sign in
  with both providers, tick on device A, observe on device B, merge-on-first-
  sync, sign-out fallback to local.
- Deploy via push-to-main only (repo rule `DeployViaCiOnly`).

## Out of scope

- Hardcover integration (future phase — this identity is its foundation).
- Account management UI, account deletion flows (a "sign out" is all v1 has;
  KV records are wipeable by slug/uid on request).
- Realtime push between simultaneously-open devices (load-time + write-time
  sync only).
- Facebook login.
