# Book Club — Design Spec (+ plan)

**Date:** 2026-09-17
**Status:** Approved by Gavin in-chat (experience-level design + chili-pepper addition)
**Path:** Architectural (new page + admin editing + quiz on existing auth/KV infra)

## Purpose

`/reading/book-club`: the page for Gavin & Kelsie's two-person book club.
Shows the book of the month (populated from a pasted StoryGraph/Goodreads/
Hardcover URL), keeps a month-by-month archive, and hosts a mood-match quiz
the two of them answer separately to converge on the next pick — including
an **allowed spice level in chili peppers** whenever romance is in play
(shared allowed level = min of both answers).

## Decisions (from chat)

- Quiz style: **mood match** (independent answers, page shows overlap). It
  produces a *profile*, not a book recommendation (no books API in v1).
- Editors: **Gavin + Kelsie** via the existing OAuth sign-in; everyone else
  read-only. Kelsie joins via a one-time **invite link** minted by Gavin.
- **Archive: yes.**
- Chili question is **conditional**: shown when genre is romance/romantasy
  or romance-content ≠ none. Match-up shows min(both) as the allowed level.

## Data (Cloudflare KV, existing `READING_SYNC` namespace, `bookclub:` prefix)

- `bookclub:admins` → `{v:1, admins:[{uid, name}]}`. Seeded out-of-band with
  Gavin's uid (taken from the existing progress key via wrangler — never
  hardcoded in the repo). No self-bootstrap code path.
- `bookclub:picks` → `{v:1, picks:[{id, month:"YYYY-MM", title, author,
  coverUrl, description, url, source, addedBy(name), addedAt}]}` (one doc;
  one pick per month, saving a month replaces it).
- `bookclub:quiz:<uid>` → `{v:1, name, answers:{qid:optionId|string},
  updatedAt}` (latest only; retake overwrites).
- `bookclub:invite:<code>` → `{v:1}` with KV `expirationTtl` 7 days,
  deleted on acceptance (single-use). Code = 32-byte random token.

## API (`/api/bookclub/*`, session via existing sealed cookie)

- `GET /api/bookclub` — public: `{current, archive}` (picks split by current
  month, NZ irrelevant — month is a label). If caller is an admin, adds
  `{isAdmin:true, me:{name}, quizzes:[{name, answers, updatedAt, mine}]}`.
- `POST /api/bookclub/preview` — admin: `{url}` → server-side fetch (host
  allowlist: thestorygraph.com, goodreads.com, hardcover.app + www/app
  subdomains) → best-effort OG parse `{title, author, coverUrl,
  description, source}`. Parsing is best-effort BY DESIGN: the admin form
  shows the fields editable before saving, so imperfect scrapes are fixed
  by hand, and total fetch failure degrades to manual entry.
- `POST /api/bookclub/pick` — admin: zod-validated `{month, url, title,
  author?, coverUrl?, description?}` → upsert into picks by month.
  `DELETE` with `{month}` removes.
- `GET/PUT /api/bookclub/quiz` — admin: own + others' latest answers / save
  own `{name, answers}` (answers validated against the question definitions).
- `POST /api/bookclub/invite` — admin: mint code → `{code}` (page composes
  the link). `POST /api/bookclub/invite/accept` — any signed-in user:
  `{code, name}` → added to admins, code deleted.

Non-admin calls to admin endpoints: 403 (401 when signed out). All
`no-store`.

## Quiz questions (defined once in `src/lib/bookclub.ts`, shared client/server)

genre (fantasy / romantasy / romance / sci-fi / mystery-thriller /
contemporary) · vibe (cozy / whimsical / adventurous / dark / devastating) ·
pace (slow burn / steady / page-turner) · weight (light / medium / heavy) ·
length (<300 / 300–500 / 500+) · shape (standalone / series starter /
continue a series) · romance content (none / subplot / front and centre) ·
**spice** (conditional): 🌶️ sweet — kisses only / 🌶️🌶️ warm — fade to black /
🌶️🌶️🌶️ open door / 🌶️🌶️🌶️🌶️ steamy / 🌶️🌶️🌶️🌶️🌶️ five-alarm ·
radar (free text, optional, ≤500 chars).

Match-up (client-side): agreements highlighted; differences side-by-side;
spice row shows min(both) as "allowed heat" with chilis; summary sentence
built from agreements; radar lists shown to each other.

## UI

- `src/app/reading/book-club/page.tsx` (server, force-dynamic, metadata) →
  `src/components/reading/BookClub.tsx` (`"use client"`, fetches
  `/api/bookclub` + `/api/auth/session`).
- Sections: current pick hero (cover, title, author, month badge, blurb,
  outbound link) → admin panel (URL + month + preview/edit + save; invite
  button; visible to admins only) → quiz (admins only; conditional chili
  question; save) → match-up (when ≥2 admins have answered) → archive shelf.
- Reading-shelf hub gets a Book Club card above the guides.
- Styling: shell tokens only, `bc-*` classes appended to `reading.css`.

## Out of scope (v1)

- Book *recommendations* from the quiz (needs a books API; later this can
  hook into the Hardcover stack).
- More than one pick per month; voting; comments; RSS.
- PDF anything.

## Verification

lint + build; local pass with hand-sealed dev cookies for TWO fake admins
(seeded in miniflare KV): pick preview/save/delete, invite mint+accept,
quiz save both sides, match-up incl. chili min, public read-only view,
403/401 paths. Deploy via push-to-main; live: public page 200, admin
endpoints 401/403 signed-out, seed real admins doc, Gavin does the on-page
E2E.
