// Feature flags — flip when the gated work ships.
//
// blogSameOrigin: the blog is served same-origin at /blog (plan 5 of the
// unified-shell initiative: a Cloudflare edge route to the Hugo build). Until
// that lands, /blog would 404, so "blog" links point at the live
// blog.nerdz.cloud subdomain instead — letting the unified shell ship without
// a broken nav. Flip to true once the edge route + bespoke Hugo front end are
// live, and the blog crossover becomes a same-origin (View-Transition) hop.
export const FLAGS = {
  blogSameOrigin: false,
} as const;

// The blog destination, derived from the flag: same-origin once merged, the
// live subdomain (external, new tab) until then. Used by every "blog" link
// (Topbar, Teasers, Colophon) so they stay consistent.
export const blogLink: { href: string; external: boolean } = FLAGS.blogSameOrigin
  ? { href: "/blog", external: false }
  : { href: "https://blog.nerdz.cloud", external: true };
