import { loader } from 'fumadocs-core/source';
import { docs } from '../../.source/server';

// Fumadocs source loader for the Lighthouse manual spike.
// baseUrl maps to the App Router route group at src/app/manuals/lighthouse/.
export const source = loader({
  baseUrl: '/guides',
  source: docs.toFumadocsSource(),
});
