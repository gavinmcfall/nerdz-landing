// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"home/index.mdx": () => import("../src/content/guides/home/index.mdx?collection=docs"), "lighthouse/architecture-and-topology.mdx": () => import("../src/content/guides/lighthouse/architecture-and-topology.mdx?collection=docs"), "lighthouse/concept-and-why.mdx": () => import("../src/content/guides/lighthouse/concept-and-why.mdx?collection=docs"), "lighthouse/curation-and-gating.mdx": () => import("../src/content/guides/lighthouse/curation-and-gating.mdx?collection=docs"), "lighthouse/gotchas-and-troubleshooting.mdx": () => import("../src/content/guides/lighthouse/gotchas-and-troubleshooting.mdx?collection=docs"), "lighthouse/gpu-worker-setup.mdx": () => import("../src/content/guides/lighthouse/gpu-worker-setup.mdx?collection=docs"), "lighthouse/images.mdx": () => import("../src/content/guides/lighthouse/images.mdx?collection=docs"), "lighthouse/index.mdx": () => import("../src/content/guides/lighthouse/index.mdx?collection=docs"), "lighthouse/licence-gate-security-model.mdx": () => import("../src/content/guides/lighthouse/licence-gate-security-model.mdx?collection=docs"), "lighthouse/model-acquisition.mdx": () => import("../src/content/guides/lighthouse/model-acquisition.mdx?collection=docs"), "lighthouse/operations-lifecycle.mdx": () => import("../src/content/guides/lighthouse/operations-lifecycle.mdx?collection=docs"), "lighthouse/prerequisites.mdx": () => import("../src/content/guides/lighthouse/prerequisites.mdx?collection=docs"), "lighthouse/reference-deploy.mdx": () => import("../src/content/guides/lighthouse/reference-deploy.mdx?collection=docs"), }),
};
export default browserCollections;