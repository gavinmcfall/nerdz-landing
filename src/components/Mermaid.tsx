'use client';

import { useEffect, useId, useState } from 'react';

// Client-side Mermaid renderer. The remark plugin (src/lib/remark-mermaid.ts)
// converts every ```mermaid``` fence into <Mermaid chart="..." />; this
// component lazy-imports the mermaid library and renders the diagram to SVG
// after hydration. The diagram is themed against our velvet palette by
// passing mermaid an explicit themeVariables map (mermaid's "dark" theme is
// the base; we just retint the relevant tokens).
export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '-');
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: mermaid } = await import('mermaid');
      // ⚠️ `@mermaid-js/layout-elk` v0.2.1 throws a circular-JSON error in
      // any React/Next runtime because its layout request includes DOM refs
      // that get JSON-stringified, and document.body is fiber'd. Tried both
      // securityLevel='loose' and a detached container — both fail inside
      // the layout package itself. Falling back to dagre + step curves.
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        themeVariables: {
          // Velvet palette — keep the diagrams in the same key as the site.
          background: 'transparent',
          primaryColor: '#1a1525',           // node fill
          primaryTextColor: '#f1e8d6',       // node text
          primaryBorderColor: '#6A0DAD',     // node border
          lineColor: '#a855f7',              // edges
          secondaryColor: '#14101e',         // secondary fills (subgraphs)
          tertiaryColor: '#0a0712',          // outer canvas
          mainBkg: '#1a1525',
          edgeLabelBackground: '#0a0712',
          fontFamily: 'var(--font-mono), ui-monospace, monospace',
        },
        flowchart: {
          curve: 'step',
          nodeSpacing: 70,
          rankSpacing: 80,
          padding: 16,
          useMaxWidth: true,
        },
        sequence: {
          // sequenceDiagram doesn't use curves; bump spacing for readability.
          messageMargin: 32,
          boxMargin: 12,
        },
      });
      // Mermaid's sequenceDiagram parser treats `<word>` placeholders as
      // malformed arrows (`<<-` etc.). Strip the brackets — the placeholder
      // reads fine without them. (Other parser quirks like quote handling
      // are fixed in the source MDX directly.)
      const sanitized = chart.replace(/<([A-Za-z][\w-]*)>/g, '$1');
      try {
        // Render into a detached container so the ELK layout loader can't
        // reach the React-fiber'd document.body when it JSON.stringifies its
        // layout request. Detached element has no fibers attached.
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.visibility = 'hidden';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        try {
          const { svg: rendered } = await mermaid.render(`mermaid-${id}`, sanitized, container);
          if (!cancelled) setSvg(rendered);
        } finally {
          container.remove();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('MERMAID_RENDER_ERR', e);
        if (!cancelled) setSvg('<pre style="white-space:pre-wrap">' + sanitized + '</pre>');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <div
      className="mermaid-diagram"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
