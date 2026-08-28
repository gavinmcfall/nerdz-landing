# Reading Sync via OAuth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cross-device reading-checklist sync: Google/Discord OAuth (opaque-ID-only), progress in Cloudflare KV, localStorage kept as cache/fallback.

**Architecture:** Hand-rolled authorization-code+PKCE OAuth on App Router route handlers (no new deps, WebCrypto HMAC session cookie), KV binding `READING_SYNC` via `getCloudflareContext()`, client sync layered into the existing `useSyncExternalStore` progress store.

**Tech Stack:** Next.js 16 route handlers, WebCrypto, Cloudflare KV, `@opennextjs/cloudflare` context, zod.

**Spec:** `docs/superpowers/specs/2026-08-28-reading-sync-auth-design.md`

## Global Constraints

- No new npm dependencies.
- Client JS never sees user ids or provider tokens; `GET /api/auth/session` returns only `{signedIn, provider?}`.
- Stored identity is exactly `google:<sub>` / `discord:<id>`; no other profile fields persisted.
- Scopes: Google `openid`; Discord `identify`.
- Secrets are Worker secrets (`AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`); local dev via `.dev.vars` (add to `.gitignore`). Never committed, never printed.
- Deploy only via push-to-main (repo rule `DeployViaCiOnly`).
- Commit trailers per user rules (Assisted-by + Agentically-Engineered).

---

### Task 1: Auth core lib

**Files:** Create `src/lib/auth/crypto.ts`, `src/lib/auth/session.ts`, `src/lib/auth/providers.ts`, `src/lib/auth/env.ts`

**Interfaces (produced):**
- `crypto.ts`: `hmacSign(secret, data): Promise<string>` (base64url), `randomToken(bytes): string`, `sha256base64url(s): Promise<string>` (PKCE challenge), `timingSafeEqual(a, b): boolean`.
- `session.ts`: `sealCookie(secret, payload: object, maxAgeSec): Promise<string>` / `openCookie<T>(secret, value): Promise<T | null>` (exp-checked); `SESSION_COOKIE = "nerdz_session"`, `LOGIN_COOKIE = "nerdz_oauth"`; `SessionPayload = { uid: string; provider: "google" | "discord"; iat: number; exp: number }`; `readSession(req): Promise<SessionPayload | null>`.
- `providers.ts`: per provider `{ authorizeUrl(params), tokenExchange(code, verifier, redirectUri): Promise<uid>` } — Google reads `sub` from `id_token` payload; Discord calls `/users/@me`.
- `env.ts`: `getAuthEnv()` pulling the 5 secrets from `getCloudflareContext().env` with `process.env` fallback (dev), throwing a clear error naming any missing one.

- [ ] Implement; `npx tsc --noEmit` clean.
- [ ] Commit `feat(reading-sync): auth core (WebCrypto cookies, PKCE, provider adapters)`.

### Task 2: Auth routes

**Files:** Create `src/app/api/auth/login/[provider]/route.ts`, `src/app/api/auth/callback/[provider]/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/session/route.ts`

**Interfaces:** as specced: login sets sealed `{state, verifier, from}` cookie (600s) and 302s to provider; callback validates state, exchanges code, seals session cookie (180d), 302s to validated same-origin relative `from` (default `/reading`), and appends `?synced=1` marker-free (no marker — plain return). Unknown provider → 404. Errors → redirect `from` + `?auth_error=1`. logout POST clears cookie. session GET returns `{signedIn, provider?}` with `Cache-Control: no-store`.

- [ ] Implement routes (`export const dynamic = "force-dynamic"` where needed).
- [ ] Verify without creds: dev server — `/api/auth/session` → `{signedIn:false}`; `/api/auth/login/google` with dummy `.dev.vars` 302s to accounts.google.com with correct params (scope=openid, PKCE S256, state); callback with bad state → `auth_error` redirect; logout 200s.
- [ ] Commit `feat(reading-sync): OAuth login/callback/session/logout routes`.

### Task 3: KV + progress API

**Files:** Modify `wrangler.jsonc` (add `kv_namespaces: [{ binding: "READING_SYNC", id: <created id> }]`); Create `src/app/api/reading/progress/route.ts`, `src/lib/reading-sync.ts` (shared zod schema `{v: literal 1, checked: string[]}` + per-guide id filtering + `MAX_BODY = 16KB`).

**Steps:**
- [ ] `npx wrangler kv namespace create READING_SYNC` (nerdz account, OAuth wrangler) → paste id into `wrangler.jsonc`.
- [ ] GET/PUT handlers: 401 without session; guide slug must exist (`getGuide`); PUT drops unknown item ids, stores `{v:1, checked, updatedAt}` at `progress:<uid>:<slug>`; GET returns stored or empty record. `no-store`.
- [ ] Verify: dev server (miniflare KV) — 401 signed out; with a hand-sealed dev cookie (AUTH_SECRET from `.dev.vars`), PUT then GET round-trips; unknown guide 404; oversized body 413.
- [ ] Commit `feat(reading-sync): KV progress store + API`.

### Task 4: Client sync + UI

**Files:** Modify `src/components/reading/ReadingGuide.tsx`, `src/app/reading/reading.css`; Create `src/components/reading/SyncControl.tsx`

**Behavior:**
- Extend the progress store: after hydration, `GET /api/auth/session`; if signed in → `GET` progress; merge-union + `PUT` when `nerdz.reading.synced.<slug>` flag absent, else adopt remote; set flag. Toggles: local write + 600ms-debounced `PUT`. PUT failure → status "offline", retry on next toggle/load.
- `SyncControl` in the progress bar: signed-out → "Sign in to sync" button opening popover (Google btn, Discord btn → `/api/auth/login/<p>?from=<path>`, ⓘ tooltip with the spec's privacy copy); signed-in → "Syncing ✓" + provider name + Sign out (POST logout, then local-only, flag cleared).
- [ ] Implement + CSS (tokens only, popover + tooltip styles).
- [ ] Verify in dev browser: signed-out unchanged behavior; popover renders; tooltip copy correct; (full sync loop deferred to post-credentials E2E).
- [ ] `npm run lint` + `npm run build` clean.
- [ ] Commit `feat(reading-sync): sync-aware checklist + sign-in UI`.

### Task 5: Ship + docs

- [ ] `.gitignore` += `.dev.vars`; journal + worklog updates; push to main → CI deploy; verify live routes still 200 and `/api/auth/session` returns `{signedIn:false}` in prod.
- [ ] Commit `chore(reading-sync): journal + plan checkboxes` (with the push).

### Task 6: Credentials walkthrough + live E2E (interactive with Gavin)

- [ ] Google Cloud Console via Gavin's Chrome: project (existing or `nerdz-cloud`), OAuth consent screen (external, app name `nerdz.cloud`, minimal), client type Web, redirect URIs prod+localhost. Capture client id/secret.
- [ ] Discord Developer Portal: New Application `nerdz.cloud reading`, OAuth2 redirect URIs prod+localhost. Capture id/secret.
- [ ] `wrangler secret put` × 5 (AUTH_SECRET generated locally); mirror into `.dev.vars`.
- [ ] Live E2E: sign in both providers, tick on A, see on B, merge-on-first-sync, sign out.

## Self-Review

- Spec coverage: auth core/routes (T1–2), KV+API (T3), client+privacy UI (T4), deploy (T5), credentials+E2E (T6). Out-of-scope items excluded. Types consistent (`SessionPayload.uid` = storage key segment; session route never returns uid).
