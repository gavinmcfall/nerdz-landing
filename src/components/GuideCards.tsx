import { source } from '@/lib/source';
import { Cards, Card } from 'fumadocs-ui/components/card';
import type { Folder } from 'fumadocs-core/page-tree';

// Auto-rendered card grid of every root-level guide in src/content/guides/,
// EXCLUDING the `home` folder (the landing tab that renders this component).
// Each guide's title + description come from its meta.json; href points at
// the guide's first chapter URL — same destination as picking the guide from
// the sidebar dropdown. Add a new guide folder with `meta.json` `root:true`
// → new card appears here next build, no code change needed.
const LANDING_FOLDER = 'home';

function firstChildUrl(node: Folder): string | undefined {
  const first = node.children?.[0];
  return first && 'url' in first ? first.url : undefined;
}

export function GuideCards() {
  const guides = (source.pageTree.children ?? [])
    .filter(
      (node): node is Folder => node.type === 'folder' && !!node.root,
    )
    .filter((node) => node.$ref?.folder !== LANDING_FOLDER);

  return (
    <Cards>
      {guides.map((g) => (
        <Card
          key={String(g.name)}
          title={g.name}
          description={g.description}
          href={firstChildUrl(g) ?? '/guides'}
        />
      ))}
    </Cards>
  );
}
