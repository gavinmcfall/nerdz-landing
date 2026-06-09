import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Fumadocs built-in search (Orama, free + self-hosted, indexes from source loader).
// Ctrl+K in the DocsLayout hits this endpoint. With more than one Fumadocs
// collection wired up later we can add tag filtering — see
// fumadocs.dev/docs/headless/search/orama#tag-filter.
export const { GET } = createFromSource(source, {
  language: 'english',
});
