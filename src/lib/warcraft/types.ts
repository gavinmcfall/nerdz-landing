// The data format wow-armoury-sync v2 writes to the WOW_ARMORY KV namespace
// (github.com/gavinmcfall/wow-armoury-sync, "What gets stored"). The site
// only reads these; it never calls Battle.net.

export type Game = "retail" | "forever";

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
