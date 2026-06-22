// @ts-nocheck
import * as __fd_glob_14 from "../src/content/guides/lighthouse/reference-deploy.mdx?collection=docs"
import * as __fd_glob_13 from "../src/content/guides/lighthouse/prerequisites.mdx?collection=docs"
import * as __fd_glob_12 from "../src/content/guides/lighthouse/operations-lifecycle.mdx?collection=docs"
import * as __fd_glob_11 from "../src/content/guides/lighthouse/model-acquisition.mdx?collection=docs"
import * as __fd_glob_10 from "../src/content/guides/lighthouse/licence-gate-security-model.mdx?collection=docs"
import * as __fd_glob_9 from "../src/content/guides/lighthouse/index.mdx?collection=docs"
import * as __fd_glob_8 from "../src/content/guides/lighthouse/images.mdx?collection=docs"
import * as __fd_glob_7 from "../src/content/guides/lighthouse/gpu-worker-setup.mdx?collection=docs"
import * as __fd_glob_6 from "../src/content/guides/lighthouse/gotchas-and-troubleshooting.mdx?collection=docs"
import * as __fd_glob_5 from "../src/content/guides/lighthouse/curation-and-gating.mdx?collection=docs"
import * as __fd_glob_4 from "../src/content/guides/lighthouse/concept-and-why.mdx?collection=docs"
import * as __fd_glob_3 from "../src/content/guides/lighthouse/architecture-and-topology.mdx?collection=docs"
import * as __fd_glob_2 from "../src/content/guides/home/index.mdx?collection=docs"
import { default as __fd_glob_1 } from "../src/content/guides/lighthouse/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../src/content/guides/home/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "src/content/guides", {"home/meta.json": __fd_glob_0, "lighthouse/meta.json": __fd_glob_1, }, {"home/index.mdx": __fd_glob_2, "lighthouse/architecture-and-topology.mdx": __fd_glob_3, "lighthouse/concept-and-why.mdx": __fd_glob_4, "lighthouse/curation-and-gating.mdx": __fd_glob_5, "lighthouse/gotchas-and-troubleshooting.mdx": __fd_glob_6, "lighthouse/gpu-worker-setup.mdx": __fd_glob_7, "lighthouse/images.mdx": __fd_glob_8, "lighthouse/index.mdx": __fd_glob_9, "lighthouse/licence-gate-security-model.mdx": __fd_glob_10, "lighthouse/model-acquisition.mdx": __fd_glob_11, "lighthouse/operations-lifecycle.mdx": __fd_glob_12, "lighthouse/prerequisites.mdx": __fd_glob_13, "lighthouse/reference-deploy.mdx": __fd_glob_14, });