import { z } from "zod";

// ── Book club: shared types, validation, and quiz definitions ─────────
// One module feeds both the API routes (validation) and the client UI
// (question rendering), so the quiz can't drift between the two.

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// ── Picks ─────────────────────────────────────────────────────────────

export const ALLOWED_PICK_HOSTS = [
  "app.thestorygraph.com",
  "thestorygraph.com",
  "www.thestorygraph.com",
  "www.goodreads.com",
  "goodreads.com",
  "hardcover.app",
  "www.hardcover.app",
];

export function pickSource(url: string): "storygraph" | "goodreads" | "hardcover" | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (!ALLOWED_PICK_HOSTS.includes(host)) return null;
    if (host.includes("storygraph")) return "storygraph";
    if (host.includes("goodreads")) return "goodreads";
    return "hardcover";
  } catch {
    return null;
  }
}

export const PickSchema = z.object({
  id: z.string().min(1),
  month: z.string().regex(MONTH_RE),
  title: z.string().min(1).max(300),
  author: z.string().max(200).default(""),
  coverUrl: z.string().url().max(1000).or(z.literal("")).default(""),
  description: z.string().max(2000).default(""),
  url: z.string().url().max(1000),
  source: z.enum(["storygraph", "goodreads", "hardcover"]),
  addedBy: z.string().max(100).default(""),
  addedAt: z.string().default(""),
});
export type Pick = z.infer<typeof PickSchema>;

export const SavePickSchema = z.object({
  month: z.string().regex(MONTH_RE),
  url: z.string().url().max(1000),
  title: z.string().min(1).max(300),
  author: z.string().max(200).optional(),
  coverUrl: z.string().url().max(1000).or(z.literal("")).optional(),
  description: z.string().max(2000).optional(),
});

export type PicksDoc = { v: 1; picks: Pick[] };

// ── Quiz ──────────────────────────────────────────────────────────────

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  /** All club questions are pick-several: a tick means "happy with this". */
  multi?: boolean;
};

export const SPICE_QUESTION_ID = "spice";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "genre",
    prompt: "What genres are you in the mood for?",
    multi: true,
    options: [
      { id: "fantasy", label: "Fantasy" },
      { id: "romantasy", label: "Romantasy" },
      { id: "romance", label: "Romance" },
      { id: "scifi", label: "Sci-fi" },
      { id: "mystery", label: "Mystery / thriller" },
      { id: "contemporary", label: "Contemporary" },
    ],
  },
  {
    id: "vibe",
    prompt: "What's the vibe?",
    multi: true,
    options: [
      { id: "cozy", label: "Cozy" },
      { id: "whimsical", label: "Whimsical" },
      { id: "adventurous", label: "Adventurous" },
      { id: "dark", label: "Dark" },
      { id: "devastating", label: "Emotionally devastating" },
    ],
  },
  {
    id: "pace",
    prompt: "Pace?",
    multi: true,
    options: [
      { id: "slow-burn", label: "Slow burn" },
      { id: "steady", label: "Steady" },
      { id: "page-turner", label: "Page-turner" },
    ],
  },
  {
    id: "weight",
    prompt: "How heavy can the themes get?",
    multi: true,
    options: [
      { id: "light", label: "Keep it light" },
      { id: "medium", label: "Some weight is fine" },
      { id: "heavy", label: "Wreck me" },
    ],
  },
  {
    id: "length",
    prompt: "Length?",
    multi: true,
    options: [
      { id: "short", label: "Under 300 pages" },
      { id: "standard", label: "300–500 pages" },
      { id: "chonker", label: "500+ — bring the chonker" },
    ],
  },
  {
    id: "shape",
    prompt: "Standalone or series?",
    multi: true,
    options: [
      { id: "standalone", label: "Standalone" },
      { id: "series-starter", label: "Start a new series" },
      { id: "series-continue", label: "Continue a series we're in" },
    ],
  },
  {
    id: "romance",
    prompt: "Romance content?",
    multi: true,
    options: [
      { id: "none", label: "None, please" },
      { id: "subplot", label: "A subplot is nice" },
      { id: "central", label: "Front and centre" },
    ],
  },
  {
    id: SPICE_QUESTION_ID,
    prompt: "Allowed heat level?",
    multi: true,
    options: [
      { id: "1", label: "🌶️ Sweet — kisses only" },
      { id: "2", label: "🌶️🌶️ Warm — fade to black" },
      { id: "3", label: "🌶️🌶️🌶️ Open door" },
      { id: "4", label: "🌶️🌶️🌶️🌶️ Steamy" },
      { id: "5", label: "🌶️🌶️🌶️🌶️🌶️ Five-alarm" },
    ],
  },
];

export const RADAR_QUESTION_ID = "radar";
export const RADAR_MAX = 500;

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** Normalize any stored answer to an array of option ids (legacy answers
 * on multi questions were single strings). */
export function answerIds(v: AnswerValue | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** The chili question only applies when romance is in play. */
export function spiceApplies(answers: Answers): boolean {
  const genres = answerIds(answers.genre);
  return (
    genres.includes("romance") ||
    genres.includes("romantasy") ||
    answerIds(answers.romance).some((id) => id !== "none")
  );
}

const AnswersSchema = z.record(
  z.string(),
  z.union([
    z.string().max(RADAR_MAX),
    z.array(z.string().max(64)).max(10),
  ]),
);

export const SaveQuizSchema = z.object({
  name: z.string().min(1).max(60),
  answers: AnswersSchema,
});

/** Drop unknown question ids / option ids; keep radar free text. Multi
 * questions store arrays; single questions store one id (an array sent to
 * a single question keeps its first valid pick). */
export function sanitizeAnswers(answers: Answers): Answers {
  const out: Answers = {};
  for (const q of QUIZ_QUESTIONS) {
    const valid = answerIds(answers[q.id]).filter((id) =>
      q.options.some((o) => o.id === id),
    );
    const unique = [...new Set(valid)];
    if (unique.length === 0) continue;
    if (q.multi) out[q.id] = unique;
    else out[q.id] = unique[0];
  }
  const radarRaw = answers[RADAR_QUESTION_ID];
  if (typeof radarRaw === "string") {
    const radar = radarRaw.slice(0, RADAR_MAX).trim();
    if (radar) out[RADAR_QUESTION_ID] = radar;
  }
  // Spice only sticks when it applies (stale answers age out on retake).
  if (out[SPICE_QUESTION_ID] && !spiceApplies(out)) {
    delete out[SPICE_QUESTION_ID];
  }
  return out;
}

export type QuizDoc = {
  v: 1;
  name: string;
  answers: Answers;
  updatedAt: string;
};

// ── Admins & invites ──────────────────────────────────────────────────

export type AdminsDoc = { v: 1; admins: { uid: string; name: string }[] };

export const AcceptInviteSchema = z.object({
  code: z.string().min(16).max(128),
  name: z.string().min(1).max(60),
});

export const KV_ADMINS = "bookclub:admins";
export const KV_PICKS = "bookclub:picks";
export const kvQuizKey = (uid: string) => `bookclub:quiz:${uid}`;
export const kvInviteKey = (code: string) => `bookclub:invite:${code}`;
export const INVITE_TTL_SECONDS = 7 * 24 * 60 * 60;
