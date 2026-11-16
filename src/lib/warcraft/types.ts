// The data format wow-armoury-sync v2 writes to the WOW_ARMORY KV namespace
// (github.com/gavinmcfall/wow-armoury-sync, "What gets stored"). The site
// only reads these; it never calls Battle.net.

export type Game = "retail" | "forever";

// A window over a render, as fractions of the image: x is the figure's
// horizontal centre, top and height the window's vertical extent.
export type Frame = { x: number; top: number; height: number };

export type Summary = {
  key: string;
  game: Game;
  status: "ok" | "not-listed" | "error";
  route: string[];
  name: string;
  surname: string | null;
  // Absent on not-listed summaries.
  realm?: string | null;
  ruleset?: string | null;
  level?: number;
  race?: string | null;
  characterClass?: string | null;
  spec?: string | null;
  faction?: "HORDE" | "ALLIANCE" | null;
  itemLevel?: number | null;
  title?: string | null;
  guild?: string | null;
  achievementPoints?: number;
  inset?: string | null;
  // The full transparent render and where the figure stands in it: focus
  // (head and upper body, sync v2.1+) and figure (whole body, v2.2+). Absent
  // in older indexes; null when the render couldn't be read.
  portrait?: { url: string; focus: Frame; figure?: Frame } | null;
  // The scene Blizzard's Armory stands this class in (v2.2+).
  background?: string | null;
  // Primary professions, in Blizzard's order (v2.3+).
  professions?: { id: number; name: string }[];
  lastSuccessAt?: string;
  error?: string;
};

export type ArmoryIndex = {
  schemaVersion: number;
  updatedAt: string;
  characters: Summary[];
};

export type ItemStat = { text: string; negated: boolean; equipBonus: boolean };

export type Item = {
  slot: string;
  slotName: string;
  name: string;
  quality: string;
  itemLevel: number | null;
  icon: string | null;
  binding: string | null;
  inventoryType: string | null;
  subclass: string | null;
  armor: string | null;
  stats: ItemStat[];
  enchantments: string[];
  sockets: string[];
  spells: string[];
  set: string | null;
  weapon: { damage: string | null; speed: string | null; dps: string | null } | null;
  requirement: string | null;
  description: string | null;
  nameDescription: string | null;
};

export type Spec = {
  name: string;
  active: boolean;
  heroTalent: string | null;
  pvpTalents: string[];
  spentPoints: number | null;
};

export type RaidProgress = {
  expansion: string;
  instances: { name: string; modes: { difficulty: string; completed: number; total: number }[] }[];
};

export type CharacterView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  render: string | null;
  equipment: Item[];
  stats: { label: string; value: string }[];
  specs: Spec[];
  mythicPlus: { rating: number | null } | null;
  raids: RaidProgress | null;
  pvp: { honorLevel: number | null; honorableKills: number; rank: number | null };
};

// view:v1:{key}:reputation (sync v2.3+).
export type Faction = {
  id: number;
  name: string;
  standing: string;
  // Progress through the current standing; 0 of 0 at the top standing.
  value: number;
  max: number;
  renown: number | null;
  paragon: { value: number; max: number } | null;
};

export type ReputationView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  // Retail: one per expansion, newest first. Forever: Blizzard's faction
  // headers. "Other" (last) holds factions outside every header.
  groups: { name: string; factions: Faction[] }[];
};

// view:v1:{key}:achievements (sync v2.4+).
export type AchievementCount = { quantity: number; points: number };

export type AchievementCategory = AchievementCount & {
  id: number;
  name: string;
  // What the category holds for the character's faction, subcategories
  // included; null when Blizzard gives none.
  total: AchievementCount | null;
};

export type EarnedAchievement = { id: number; name: string; completedAt: string };

export type AchievementsView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  total: AchievementCount;
  // Blizzard's top-level categories, in its order; empty when unavailable.
  categories: AchievementCategory[];
  // The newest completions; points, category and icon are null until the
  // sync has looked them up.
  recent: DetailedAchievement[];
  // Every completed achievement, newest first.
  completed: EarnedAchievement[];
  // Points, category and icon for each completed achievement the sync has
  // looked up, by id (sync v2.8+; absent from older views).
  details?: Record<string, AchievementDetail>;
};

export type AchievementDetail = { points: number; category: string | null; icon: string | null };

export type DetailedAchievement = EarnedAchievement & { points: number | null; category: string | null; icon: string | null };

// view:v1:{key}:collections (sync v2.5+). Each list is sorted by name; icon
// is null until the sync has fetched it. A mount's icon is a zoomed render.
export type Collectible = { id: number; name: string; icon: string | null };

export type CollectionsView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  mounts: Collectible[];
  // One per species: how many are owned, and the highest level among them.
  pets: (Collectible & { owned: number; level: number })[];
  toys: Collectible[];
  // upgrade is 0 when the heirloom has not been upgraded.
  heirlooms: (Collectible & { upgrade: number })[];
};

// view:v1:{key}:pve (sync v2.6+).
export type PveMode = { difficulty: string; completed: number; total: number };

export type PveInstance = { id: number; name: string; modes: PveMode[] };

export type PveGroup = { id: number; name: string; instances: PveInstance[] };

export type KeystoneRun = { dungeon: string; level: number; timed: boolean; duration: number; completedAt: string; score: number };

export type PveView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  mythicPlus: { rating: number | null } | null;
  // The rating's colour and the best run in each dungeon this season (sync
  // v2.8+; absent from older views, null on Forever).
  mythicSeason?: { color: string | null; runs: KeystoneRun[] } | null;
  raids: PveGroup[];
  dungeons: PveGroup[];
};

// view:v1:{key}:pvp (sync v2.7+).
export type PvpBracket = { id: string; name: string; rating: number | null };

export type BattlegroundRecord = { name: string; played: number; won: number; lost: number };

export type PvpView = {
  schemaVersion: number;
  game: Game;
  fetchedAt: string;
  honorLevel: number | null;
  honorableKills: number;
  rank: number | null;
  brackets: PvpBracket[];
  battlegrounds: BattlegroundRecord[];
};
