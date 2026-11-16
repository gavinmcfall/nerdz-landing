// Run: node --test src/lib/warcraft/resolve.test.ts (Node strips the types).
import { test } from "node:test";
import assert from "node:assert/strict";
import { characterHref, resolveCharacterPath } from "./resolve.ts";

const CHARACTERS = [
  { route: ["retail", "barthilas", "cònsecrator"] },
  { route: ["forever", "recurve-ravenholt"] },
];

test("matches a retail character with no tab as the character tab", () => {
  assert.deepEqual(resolveCharacterPath(CHARACTERS, ["retail", "barthilas", "cònsecrator"]), { index: 0, tab: "character" });
});

test("matches encoded and decoded accents", () => {
  assert.deepEqual(resolveCharacterPath(CHARACTERS, ["retail", "barthilas", "c%C3%B2nsecrator"]), { index: 0, tab: "character" });
  assert.deepEqual(resolveCharacterPath(CHARACTERS, ["retail", "barthilas", "cònsecrator"]), { index: 0, tab: "character" });
});

test("matches regardless of letter case", () => {
  assert.deepEqual(resolveCharacterPath(CHARACTERS, ["retail", "Barthilas", "C%C3%B2nsecrator"]), { index: 0, tab: "character" });
});

test("matches a forever character with a tab", () => {
  assert.deepEqual(resolveCharacterPath(CHARACTERS, ["forever", "recurve-ravenholt", "reputation"]), { index: 1, tab: "reputation" });
});

test("an explicit character tab segment is not a second address for the same page", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["forever", "recurve-ravenholt", "character"]), null);
});

test("unknown tab is null", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["forever", "recurve-ravenholt", "talents"]), null);
});

test("unknown character is null", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["retail", "barthilas", "nobody"]), null);
});

test("extra segments are null", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["forever", "recurve-ravenholt", "pvp", "more"]), null);
});

test("a retail path cut short is null", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["retail", "barthilas"]), null);
});

test("malformed percent-encoding is null, not a throw", () => {
  assert.equal(resolveCharacterPath(CHARACTERS, ["retail", "barthilas", "%E0%A4%A"]), null);
});

test("characterHref encodes accents", () => {
  assert.equal(characterHref(["retail", "barthilas", "cònsecrator"]), "/lab/warcraft/retail/barthilas/c%C3%B2nsecrator");
});

test("characterHref adds tabs other than character", () => {
  assert.equal(characterHref(["forever", "recurve-ravenholt"], "pvp"), "/lab/warcraft/forever/recurve-ravenholt/pvp");
  assert.equal(characterHref(["forever", "recurve-ravenholt"], "character"), "/lab/warcraft/forever/recurve-ravenholt");
});
