import type { ReactNode } from "react";
import Image from "next/image";
import type { Manual } from "@/lib/manuals";

type Props = {
  manual: Manual;
  children?: ReactNode;
};

// The on-screen field manual. There is deliberately NO @page / print CSS
// here: the printable artifact is a real PDF at /manuals/<slug>.pdf, rendered
// by scripts/render_pdf.py through WeasyPrint from the same data. Web and
// print share data, not CSS — each tuned for its surface (scroll vs paper).
export function ManualLayout({ manual, children }: Props) {
  const { frontmatter, slug } = manual;
  const { title, type, paperSize, category, updated, posterAsset, designer } =
    frontmatter;

  return (
    <>
      <a className="manual__pdf-link no-print" href={`/manuals/${slug}.pdf`}>
        Download PDF →
      </a>
      {/* data-paper sizes the on-screen preview container only (screen concern,
          no print meaning — the PDF gets its size from printPaperSize). */}
      <article
        className={`manual manual--${type}`}
        data-paper={paperSize}
        aria-label={title}
      >
        {type !== "component" && (
          <header className="manual__head">
            <h1 className="manual__title">{title}</h1>
            <div className="manual__meta">
              {category} · {updated}
            </div>
          </header>
        )}

        {type === "poster" && posterAsset ? (
          <>
            <Image
              src={posterAsset}
              alt={title}
              width={2000}
              height={1414}
              priority
            />
            {designer ? (
              <div className="manual__credit">designed by {designer}</div>
            ) : null}
          </>
        ) : (
          // component + prose manuals render their body directly. component
          // manuals bring their own full visual identity inside the container.
          children
        )}
      </article>
    </>
  );
}
