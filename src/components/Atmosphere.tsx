"use client";

import { useSearchParams } from "next/navigation";

/* Atmosphere — cinematic background layer (aurora swoop, perspective grid
   floor, overhead spotlight, film-grain noise). Ported from
   docs/design-handoff/atmosphere.jsx. Behaviour:

     <Atmosphere />                    obeys ?atm=, default OFF
     <Atmosphere defaultAtm="all" />   default ON, ?atm= overrides
     ?atm=all                          every layer on
     ?atm=noise                        just the film grain
     ?atm=aurora,grid                  specific subset (csv)
     ?atm=none                         explicit off (override the default)

   CSS lives in globals.css. Wrapped in a Suspense boundary by the layout so
   routes stay statically prerendered. */
export function Atmosphere({ defaultAtm = "" }: { defaultAtm?: string }) {
  const sp = useSearchParams();
  const queryAtm = sp?.get("atm");
  // Explicit ?atm=none disables. Any other ?atm= value overrides the default.
  // No ?atm= at all → fall back to the default.
  const atm =
    queryAtm === "none" ? "" : queryAtm != null ? queryAtm : defaultAtm;
  const enabled = new Set(
    atm
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const all = enabled.has("all");
  const show = (k: string) => all || enabled.has(k);

  if (!enabled.size) return null;

  return (
    <>
      {show("aurora") && (
        <div className="aurora" aria-hidden="true">
          <div className="aurora__band aurora__band--a" />
          <div className="aurora__band aurora__band--b" />
          <div className="aurora__band aurora__band--c" />
        </div>
      )}
      {show("spotlight") && <div className="spotlight" aria-hidden="true" />}
      {show("grid") && (
        <div className="gridfloor" aria-hidden="true">
          <div className="gridfloor__lines" />
          <div className="gridfloor__glow" />
        </div>
      )}
      {show("noise") && <div className="noise" aria-hidden="true" />}
    </>
  );
}
