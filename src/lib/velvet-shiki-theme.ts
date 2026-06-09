import type { ThemeRegistration } from 'shiki';

// Velvet Shiki theme — pulls from shell-tokens.css:
//   bg #0a0712, ink #f1e8d6, ink-mid #d8cfb9, ink-mute #a39a85,
//   purple #6A0DAD, glow #a855f7, glow-soft #c084fc, gold #c9a86e, gold-soft #d9b97f
//
// Token mapping:
//   comment   → ink-mute, italic   (low-noise side notes)
//   string    → gold                (warm, distinct from purple)
//   keyword   → glow                (the velvet accent)
//   function  → glow-soft           (call-site contrast)
//   number    → glow-soft
//   variable  → ink-mid             (most body text on dark)
//   constant  → purple              (true purple for true literals)
//   punctuation → ink-mute          (recede)
export const velvetDark: ThemeRegistration = {
  name: 'velvet-dark',
  type: 'dark',
  colors: {
    'editor.background': '#0a0712',
    'editor.foreground': '#f1e8d6',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#a39a85', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#c9a86e' } },
    { scope: ['string.template', 'meta.embedded'], settings: { foreground: '#d9b97f' } },
    { scope: ['constant.language', 'constant.numeric', 'constant.other.symbol'], settings: { foreground: '#c084fc' } },
    { scope: ['keyword', 'keyword.control', 'keyword.operator.new', 'storage.type', 'storage.modifier'], settings: { foreground: '#a855f7' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: '#c084fc' } },
    { scope: ['entity.name.tag', 'entity.name.type', 'support.type'], settings: { foreground: '#a855f7' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#c9a86e' } },
    { scope: ['variable', 'variable.parameter', 'variable.other.readwrite'], settings: { foreground: '#d8cfb9' } },
    { scope: ['variable.language.this', 'variable.language.self'], settings: { foreground: '#a855f7', fontStyle: 'italic' } },
    { scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: '#a39a85' } },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: '#f1e8d6', fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.inserted'], settings: { foreground: '#c084fc' } },
    { scope: ['markup.deleted'], settings: { foreground: '#c9a86e' } },
  ],
};

// Light variant for [data-theme="light"] — paper + dark velvet ink + deep purple.
export const velvetLight: ThemeRegistration = {
  name: 'velvet-light',
  type: 'light',
  colors: {
    'editor.background': '#efe6d2',
    'editor.foreground': '#1a141f',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5e5468', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#8a7547' } },
    { scope: ['constant.language', 'constant.numeric'], settings: { foreground: '#5a0e93' } },
    { scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'], settings: { foreground: '#5a0e93' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#6A0DAD' } },
    { scope: ['entity.name.tag', 'entity.name.type', 'support.type'], settings: { foreground: '#5a0e93' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#8a7547' } },
    { scope: ['variable', 'variable.parameter'], settings: { foreground: '#2a2230' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#5e5468' } },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: '#1a141f', fontStyle: 'bold' } },
  ],
};
