## [2.6.6](https://github.com/fenrick/MiroDiagramming/compare/v2.6.5...v2.6.6) (2025-09-30)


### Bug Fixes

* Update cleanup.yml ([e5bccd9](https://github.com/fenrick/MiroDiagramming/commit/e5bccd954835761c9cafa62ae55605ad1e774076))

## [2.6.5](https://github.com/fenrick/MiroDiagramming/compare/v2.6.4...v2.6.5) (2025-09-30)


### Bug Fixes

* **core:** address lint in utility modules ([210c543](https://github.com/fenrick/MiroDiagramming/commit/210c543583593bd0041b3e68fe085f1784302d56))

## [2.6.4](https://github.com/fenrick/MiroDiagramming/compare/v2.6.3...v2.6.4) (2025-09-30)


### Bug Fixes

* **eslint:** set globalIgnores and project settings ([35b1528](https://github.com/fenrick/MiroDiagramming/commit/35b152840a3273e7851b25eca3d1658846dbc577))

## [2.6.3](https://github.com/fenrick/MiroDiagramming/compare/v2.6.2...v2.6.3) (2025-09-30)


### Bug Fixes

* **lint:** sync resizeItem; optional-chain cleanup ([a2e358b](https://github.com/fenrick/MiroDiagramming/commit/a2e358bda3bcb80fffffa092d81bcd2e451836f3))

## [2.6.2](https://github.com/fenrick/MiroDiagramming/compare/v2.6.1...v2.6.2) (2025-09-29)


### Bug Fixes

* **parser:** replace risky regex with string parsing in parseSubgraphs ([db5db1b](https://github.com/fenrick/MiroDiagramming/commit/db5db1b8052c703530edddc6e6e03c2f1f18d782))

## [2.6.1](https://github.com/fenrick/MiroDiagramming/compare/v2.6.0...v2.6.1) (2025-09-29)


### Bug Fixes

* **templates:** apply experimental shape overrides verbatim (preserve 'diamond'); all tests passing ([4be2405](https://github.com/fenrick/MiroDiagramming/commit/4be24059d54335e4ca5186060d73b670e120662c))

# [2.6.0](https://github.com/fenrick/MiroDiagramming/compare/v2.5.0...v2.6.0) (2025-09-29)


### Features

* **layout:** nested subgraphs via Dagre proxies ([5939ebe](https://github.com/fenrick/MiroDiagramming/commit/5939ebe3289f8b9ea58f8d9bc32f69c22084b5e2))

# [2.5.0](https://github.com/fenrick/MiroDiagramming/compare/v2.4.1...v2.5.0) (2025-09-29)


### Features

* **layout:** dagre compound, convergence, spacing parity, tests ([d68ed68](https://github.com/fenrick/MiroDiagramming/commit/d68ed68c6c80fe98e5d81ff6b257b592a0a26e9a))

## [2.4.1](https://github.com/fenrick/MiroDiagramming/compare/v2.4.0...v2.4.1) (2025-09-29)


### Bug Fixes

* **core:** allow & in alias keys to preserve existing presets ([c9b9183](https://github.com/fenrick/MiroDiagramming/commit/c9b91838a62e10590571675f7ca124a8da60ffca))
* **security:** harden dynamic lookups across board utilities ([9c258db](https://github.com/fenrick/MiroDiagramming/commit/9c258db3af0c793e43f01fefbb08321b4a987580))

# [2.4.0](https://github.com/fenrick/MiroDiagramming/compare/v2.3.0...v2.4.0) (2025-09-28)


### Bug Fixes

* **board:** avoid callback reference; use toSorted; safe size guard ([4926a87](https://github.com/fenrick/MiroDiagramming/commit/4926a87187b7322c78c48e877940cd02355da5c9))
* **board:** avoid dynamic key assignment in element-utilities to reduce injection risk ([5c97778](https://github.com/fenrick/MiroDiagramming/commit/5c9777838958a90bca4a085abda6c40be04dc3b8))
* **board:** reduce object-injection warnings in spacing/style tools ([0df326b](https://github.com/fenrick/MiroDiagramming/commit/0df326b57225d8a24111dfafb714e12ca59eec6b))
* **board:** rename loop variable in grid-layout for lint clarity ([ccf446e](https://github.com/fenrick/MiroDiagramming/commit/ccf446e838eb52528d227e39ffed994f60e236fe))
* **board:** rename loop vars in templates; toSorted + safe catch; explicit size guard; no callback reference ([ddf6710](https://github.com/fenrick/MiroDiagramming/commit/ddf671004ef7a1cab91791b50cd987d2b68ef4a4))
* **board:** sanitize shape style colors before SDK calls (hex-only) ([0f5a5c2](https://github.com/fenrick/MiroDiagramming/commit/0f5a5c2e4270446e74b71991623d73fe88dba045))
* **board:** use Array.at for positions to reduce object-injection lint noise ([35f6a38](https://github.com/fenrick/MiroDiagramming/commit/35f6a38bee18f5658e71a8c60701baa6be82fa56))
* **core,ui:** lint fixes (promises, code points, scoping, toSorted, no-callback-ref, unused param) ([c550e6d](https://github.com/fenrick/MiroDiagramming/commit/c550e6d1d342695adeb1050efb19c6fc956ae746))
* **core:** avoid indexed access in use-focus-trap (object-injection lint) ([cf25321](https://github.com/fenrick/MiroDiagramming/commit/cf25321afc5375f62491f61d6a4762dd59bdb87d))
* **core:** explicit length checks in mermaid converter filters (lint: explicit-length-check) ([de64f8b](https://github.com/fenrick/MiroDiagramming/commit/de64f8b9ae8a9c901976d7003e3da9ae316682a0))
* **core:** make regex groups non-capturing; lower complexity in state/class converters ([aac71e3](https://github.com/fenrick/MiroDiagramming/commit/aac71e30e70d9a3e24b071ec564dee0d2456b7a4))
* **core:** remove array index lookups (use .at) in layout utils; add switch braces in elk-options ([ee03916](https://github.com/fenrick/MiroDiagramming/commit/ee0391613abe5cc6bacfc8eded216970b6e8c938))
* **hooks+layout:** kebab-case hook files and event param names; remove unused regex capture in templates; lift dynamic import in elk-loader ([4c9fd67](https://github.com/fenrick/MiroDiagramming/commit/4c9fd67710e73800fc767a1433aee7c9da3bb5a3))
* **hooks+layout:** rename event params; map param names in layout-core; remove unused capture; lift dynamic import ([dd8b09c](https://github.com/fenrick/MiroDiagramming/commit/dd8b09c88427b063fc4d30f4b161fbb51652df5b))
* **mermaid:** sanitize flowchart shapes and CSS colors; prevent invalid shape types at creation ([79cf153](https://github.com/fenrick/MiroDiagramming/commit/79cf153323388c32863b3595913cf300d8d30fe6))
* **ui:** align import paths with kebab-case filenames ([41a3873](https://github.com/fenrick/MiroDiagramming/commit/41a3873bf5bcd5b718641055b25592151e6b749d))
* **ui:** stop passing className/style into design-system styled components (wrap with div) ([52fa168](https://github.com/fenrick/MiroDiagramming/commit/52fa168ced05cc65ff81455eef33dbeb52a9d2d3))


### Features

* **ux:** remove shortcuts and command palette ([c4d835e](https://github.com/fenrick/MiroDiagramming/commit/c4d835e8d66aba2090e96907e18c2ae1f0717b58))

# [2.3.0](https://github.com/fenrick/MiroDiagramming/compare/v2.2.0...v2.3.0) (2025-09-28)


### Bug Fixes

* **mermaid:** class relations solid for -- ([8b47aa7](https://github.com/fenrick/MiroDiagramming/commit/8b47aa791f1c76019a4f98a0f55ca14bdc8564e1))
* **mermaid:** strip activation markers (+/-) when parsing sequence messages ([d81345f](https://github.com/fenrick/MiroDiagramming/commit/d81345f530bfb98712601e68317da431a786afe3))


### Features

* **mermaid:** add flowchart converter and renderer ([6548d45](https://github.com/fenrick/MiroDiagramming/commit/6548d459a782efefbc74ce67ac2ac120b028f177))
* **mermaid:** add labels to state transitions; nested block parsing covered by edges ([8c0f962](https://github.com/fenrick/MiroDiagramming/commit/8c0f962140783b68e9cf23c1786edb1d156a261e))
* **mermaid:** add panel tab for flowchart rendering ([08253bb](https://github.com/fenrick/MiroDiagramming/commit/08253bb18fcffa9fccae5b57b2bea81f07fb10f9))
* **mermaid:** broaden diagram support ([6f0bca9](https://github.com/fenrick/MiroDiagramming/commit/6f0bca9ad1b036db0b9d9f1de00461a7ad6cd6d3))
* **mermaid:** er parser accepts quoted entity names; add tests ([bd523c0](https://github.com/fenrick/MiroDiagramming/commit/bd523c05593249e75d805e7b0c83611b71db6dc6))
* **mermaid:** extend shape mapping for flowchart shapes ([b9532f8](https://github.com/fenrick/MiroDiagramming/commit/b9532f8ddacb5a496bcdd27ac0185cf16ad704ed))
* **mermaid:** map classes to templates ([1be7c73](https://github.com/fenrick/MiroDiagramming/commit/1be7c73c508b3b7bdb2b284661046212f2ad27c5))
* **mermaid:** map styles to native widgets ([13c004f](https://github.com/fenrick/MiroDiagramming/commit/13c004fac215db334db4b1ab385716874bf26c40))
* **mermaid:** prefer experimental flowchart shapes ([dd67c5b](https://github.com/fenrick/MiroDiagramming/commit/dd67c5bcce717eac222c85a03eabcfa897d2fc73))
* **mermaid:** support sequence and class diagrams ([a30f627](https://github.com/fenrick/MiroDiagramming/commit/a30f627a8434234c23243fd90d8ea2b6df223d78))
* **mermaid:** use native layout engine ([9a9bfd0](https://github.com/fenrick/MiroDiagramming/commit/9a9bfd09ee835e316c9038f63db6a1559d56ffbd))
* **templates:** map Application/Business/MermaidNode to experimental flowchart shapes via overrides ([7287216](https://github.com/fenrick/MiroDiagramming/commit/7287216fe66096c80771aa5556ce7383d16dd405))
* **templates:** support experimental shape overrides via templates/experimentalShapeMap.json ([b295d3f](https://github.com/fenrick/MiroDiagramming/commit/b295d3f00d7ddf2f41b9646cd6cebe21c72557a0))

# [2.2.0](https://github.com/fenrick/MiroDiagramming/compare/v2.1.3...v2.2.0) (2025-09-26)


### Features

* **ui:** improve tools panel spacing and persistence ([37df243](https://github.com/fenrick/MiroDiagramming/commit/37df243c41dae68404142973e397e69963b65afc))

## [2.1.3](https://github.com/fenrick/MiroDiagramming/compare/v2.1.2...v2.1.3) (2025-09-25)


### Bug Fixes

* **board:** normalise card id parsing ([4865496](https://github.com/fenrick/MiroDiagramming/commit/4865496f10918ae0a6972f043042ec4f53ad08f1))

## [2.1.2](https://github.com/fenrick/MiroDiagramming/compare/v2.1.1...v2.1.2) (2025-09-24)


### Bug Fixes

* **ui:** use <output> for loading indicator in StructuredTab for better a11y semantics ([def7487](https://github.com/fenrick/MiroDiagramming/commit/def7487fee86ec16d72fef366faf684cebe70f9c))

## [2.1.1](https://github.com/fenrick/MiroDiagramming/compare/v2.1.0...v2.1.1) (2025-09-22)


### Bug Fixes

* Potential fix for code scanning alert no. 23: Workflow does not contain permissions ([921f569](https://github.com/fenrick/MiroDiagramming/commit/921f56939f5cca96d2dbc43bb7d238440402ec66))

# [2.1.0](https://github.com/fenrick/MiroDiagramming/compare/v2.0.1...v2.1.0) (2025-09-22)


### Bug Fixes

* **board:** create connectors sequentially; avoid nonexistent batch API and Promise.all aborts ([30d9ec7](https://github.com/fenrick/MiroDiagramming/commit/30d9ec756ad09aed7c66ef2fca3807e3f6b87e75))
* **board:** resize via Reflect.set to ensure parent container sizes apply under SDK proxies ([a5cb6ba](https://github.com/fenrick/MiroDiagramming/commit/a5cb6ba4c2db7afcf8cfba8aad3a64989707360c))
* **connector:** omit captions field when undefined to satisfy SDK validation ([32cab36](https://github.com/fenrick/MiroDiagramming/commit/32cab36c109c6623ce0bb57faeef7a3b8877e45b))
* **nested:** create parent widgets at ELK-computed size (override template) ([d5d020b](https://github.com/fenrick/MiroDiagramming/commit/d5d020b07b518d11693835503f54743af694df2b))
* **nested:** respect template/metadata sizes for leaf nodes in ELK hierarchy ([4aff7c8](https://github.com/fenrick/MiroDiagramming/commit/4aff7c88e3ba18f4f722a71ac34e1d0aa61765a6))
* **structured:** stack file name above options for import form ([2213009](https://github.com/fenrick/MiroDiagramming/commit/22130093dc456fcef19c0f38aa56b7d7e0050338))


### Features

* **connector:** support captions via edge.metadata.caption(s) and metadata.label ([db3d607](https://github.com/fenrick/MiroDiagramming/commit/db3d607c61763dc2e29616e0379d6d4d21271406))

## [2.0.1](https://github.com/fenrick/MiroDiagramming/compare/v2.0.0...v2.0.1) (2025-09-22)


### Bug Fixes

* **deps:** update dependency @mirohq/design-system to v1.1.3 ([c20da9c](https://github.com/fenrick/MiroDiagramming/commit/c20da9c7fa4a819eab0cfcba996626ccee6127e3))

# [2.0.0](https://github.com/fenrick/MiroDiagramming/compare/v1.22.1...v2.0.0) (2025-09-18)


* feat!: ds/ui restructure and grid behavior ([c8821fb](https://github.com/fenrick/MiroDiagramming/commit/c8821fb7d644befd24a881e7c913c11e39ef93a7))


### Features

* **ui:** adopt DS primitives and tighten panel spacing ([339dfec](https://github.com/fenrick/MiroDiagramming/commit/339dfec532a3954e1f7d6003332c8dfb21719f66))


### BREAKING CHANGES

* - HTML entrypoints changed; app boot now at src/app.tsx, entry at src/index.ts.
- Panel layout/spacing uses DS tokens; panel width is 368px (was 320px).
- Arrange grid vertical fill algorithm changed; layouts differ vs prior versions.
- Grouping option creates a frame instead of a simple group (when available).

## [1.22.1](https://github.com/fenrick/MiroDiagramming/compare/v1.22.0...v1.22.1) (2025-09-18)


### Bug Fixes

* replace logfire logger and relax dev csp ([e2b844f](https://github.com/fenrick/MiroDiagramming/commit/e2b844ff7090dd352e68509e8817dd5ed0f6a5dd))
* **server:** extend csp directives for miro dev ([948f05c](https://github.com/fenrick/MiroDiagramming/commit/948f05ca6e00c560e6263ac8231bbf3fc9c42461))

# [1.22.0](https://github.com/fenrick/MiroDiagramming/compare/v1.21.1...v1.22.0) (2025-09-17)


### Bug Fixes

* **board-cache:** throw friendly error when board lacks getSelection ([b1e2807](https://github.com/fenrick/MiroDiagramming/commit/b1e2807b73c6c5710ab23b037734a74192303cec))
* **frontend:** resolve vite entry path ([251180d](https://github.com/fenrick/MiroDiagramming/commit/251180dcd32467b453f6073ecd3cefeab2092a80))
* **ui:** exclude roving toolbar container from focus trap sequence ([33b1400](https://github.com/fenrick/MiroDiagramming/commit/33b140009fe3182c03abb76aef7dfbcf8221140a))


### Features

* **frontend:** add command palette ([76b54d3](https://github.com/fenrick/MiroDiagramming/commit/76b54d35c11e5238f0cc15f84272544d64af5a53))
* **miro:** honor Retry-After and add jitter in withMiroRetry ([2d25e10](https://github.com/fenrick/MiroDiagramming/commit/2d25e10ce3f0556e6c278877d52ebb4596993187))
* **queue:** drain change queue on shutdown ([c95e638](https://github.com/fenrick/MiroDiagramming/commit/c95e638721b0b800e10780795d5621816288e49d))
* **server:** add SIGINT/SIGTERM graceful shutdown handling ([9aa468c](https://github.com/fenrick/MiroDiagramming/commit/9aa468cbc3da2d1fcb33ed875c30899d565fa701))
* **server:** restore shapes routes and allow miro embedding ([ea1700e](https://github.com/fenrick/MiroDiagramming/commit/ea1700ea5f171d7263dc79064cb73875af197a5f))
* **ui:** add InfoCallout and replace ad-hoc help text in StructuredTab ([4a4b43a](https://github.com/fenrick/MiroDiagramming/commit/4a4b43a14e0baef214556aa496bfbe1628cf48ac))
* **ui:** add InfoCallout notes in Frames and advanced-options guidance in Structured ([d941389](https://github.com/fenrick/MiroDiagramming/commit/d94138960e428188b6313a6925d1d3fb24a34ecb))
* **ui:** add InfoCallout tips to Style adjustments; add tips to Search/Arrange earlier; keep progressive Aura polish ([a17703e](https://github.com/fenrick/MiroDiagramming/commit/a17703ef91a89474cd2a42b4e32060619a3ad4fa))
* **ui:** add inline tips via InfoCallout in Search filters and Arrange spacing ([893aca9](https://github.com/fenrick/MiroDiagramming/commit/893aca95b9902c5b13f570c756c79a4c40653982))
* **ui:** add SidebarSection/EmptyState primitives and adopt in Help, Search, Style tabs ([ed732bc](https://github.com/fenrick/MiroDiagramming/commit/ed732bcd858b3856ef006398286a4b8fbc94050f))
* **ui:** add Skeleton component and use for loading states ([7baf91e](https://github.com/fenrick/MiroDiagramming/commit/7baf91e9e7cf20aa69c615f57ab292ddfb5d8b3c))
* **ui:** align more tabs with Aura sidebar primitives ([518b4f7](https://github.com/fenrick/MiroDiagramming/commit/518b4f77e887c3bfd051e6590ba9cd46ff5a5b91))
* **ui:** group Structured advanced controls with grid row gaps; record Aura work in implementation_plan ([de9d8e4](https://github.com/fenrick/MiroDiagramming/commit/de9d8e42eb9d56e1a2c4a36924b249d18eee4e64))
* **ui:** improve drawers a11y and loading states ([e90f78f](https://github.com/fenrick/MiroDiagramming/commit/e90f78fed850931e540bec548d674f3b45079c98))
* **ui:** input spacing + excel tips ([2dd1c91](https://github.com/fenrick/MiroDiagramming/commit/2dd1c915253754af70a2f28fa6baeece26cdb9bf))
* **ui:** sectioned UX for Structured and Excel tabs ([1c72277](https://github.com/fenrick/MiroDiagramming/commit/1c7227714a0b321af44406e89697b99872292b41))
* **ui:** tighten section rhythm and scroll area padding; add list spacing for inline help ([5e73063](https://github.com/fenrick/MiroDiagramming/commit/5e730633fe3a6f95b51302991d104df1ecdac2ef))
* **ux:** scoped keybindings and safer focus ([73031c9](https://github.com/fenrick/MiroDiagramming/commit/73031c95edc446b3d6f04d3b821efa98d9b74904))

## [1.21.5](https://github.com/fenrick/MiroDiagramming/compare/v1.21.4...v1.21.5) (2025-09-14)

### Security

* **webhook:** enforce application/json content type and 1 KB body limit
* **logger:** redact Authorization, Cookie, and x-miro-signature headers

### Docs

* document webhook content-type and size limit
* note logger redaction of sensitive headers

### Tests

* cover webhook content-type and body limit
* assert logger redacts sensitive headers

## [1.21.4](https://github.com/fenrick/MiroDiagramming/compare/v1.21.3...v1.21.4) (2025-09-14)

### Refactor

* **server:** remove custom createServer helper and rely on buildApp

### Docs

* note framework configuration in plan and architecture docs

### Tests

* adjust helmet integration test to use buildApp

## [1.21.3](https://github.com/fenrick/MiroDiagramming/compare/v1.21.2...v1.21.3) (2025-09-14)

### Features

* **server:** add security headers via helmet

### Refactor

* **server:** export createServer and guard entrypoint
* merge improvement plan into implementation plan

### Docs

* update architecture docs and AGENTS for consolidated plan and createServer
* note helmet usage in Node architecture

### Tests

* add integration test for createServer
* verify helmet adds standard security headers

## [1.21.2](https://github.com/fenrick/MiroDiagramming/compare/v1.21.1...v1.21.2) (2025-09-14)

### Refactor

* **board:** reuse shared Skeleton in BoardLoader

### Docs

* document Skeleton component
* clarify remaining skeleton tasks in improvement plan

### Tests

* fix Skeleton test import path

## [1.21.1](https://github.com/fenrick/MiroDiagramming/compare/v1.21.0...v1.21.1) (2025-09-14)


### Bug Fixes

* **board:** include board id for selection search ([3d6f474](https://github.com/fenrick/MiroDiagramming/commit/3d6f47413d9f8d9216e02998def2c50bb6c9d383))

# [1.21.0](https://github.com/fenrick/MiroDiagramming/compare/v1.20.1...v1.21.0) (2025-09-12)


### Bug Fixes

* **deps:** update dependency zod to v4.1.8 ([c599e85](https://github.com/fenrick/MiroDiagramming/commit/c599e859b2ee3d16108eb1ff0d82b9142715d2b0))


### Features

* **board:** add backend widget lookup with caching ([faff8d6](https://github.com/fenrick/MiroDiagramming/commit/faff8d69d5732f10958fa823d563ddb8ac54f7aa))

## [1.20.1](https://github.com/fenrick/MiroDiagramming/compare/v1.20.0...v1.20.1) (2025-09-11)


### Bug Fixes

* **deps:** update dependency marked to v16 ([6ae155a](https://github.com/fenrick/MiroDiagramming/commit/6ae155a4e09032311e46158416f99e69288ce18e))
* **deps:** update dependency zod to v4.1.7 ([84a2f44](https://github.com/fenrick/MiroDiagramming/commit/84a2f44f89eda02a38c75334c38e1c84b081b858))
* **deps:** update prisma monorepo to v6.16.1 ([27899fc](https://github.com/fenrick/MiroDiagramming/commit/27899fc235c8bcb79e849de596fbffe7ac7242ea))

# [1.20.0](https://github.com/fenrick/MiroDiagramming/compare/v1.19.0...v1.20.0) (2025-09-11)


### Features

* **utils:** add SPA fallback helper ([53d7072](https://github.com/fenrick/MiroDiagramming/commit/53d7072ab11ca17ca38f21c16f528ee3120307cb))

# [1.19.0](https://github.com/fenrick/MiroDiagramming/compare/v1.18.1...v1.19.0) (2025-09-11)


### Bug Fixes

* absolute path ([07fbb4b](https://github.com/fenrick/MiroDiagramming/commit/07fbb4bc7d6c52abdb5baad78629e7aaedb9b590))
* absolute paths in covey ([5dc860a](https://github.com/fenrick/MiroDiagramming/commit/5dc860ab5f57ae10c2c7d24b2b44c7751d423757))
* add button role ([2e3f5fc](https://github.com/fenrick/MiroDiagramming/commit/2e3f5fc5eec99222d9c85c45f5ee4bd7e1d4906d))
* add some clarity ([840f72d](https://github.com/fenrick/MiroDiagramming/commit/840f72d56c7299507a083e8843e66e48d15e5888))
* add tests project ([98eb9c0](https://github.com/fenrick/MiroDiagramming/commit/98eb9c0717130224c2c718c43d8571280c06fdab))
* aliases for connectors ([bfde709](https://github.com/fenrick/MiroDiagramming/commit/bfde709f949d855c9097b626c464b3b741368b9b))
* align with rider ([98e7de2](https://github.com/fenrick/MiroDiagramming/commit/98e7de2245455d2fdc4b1266d0fc051368210a17))
* **apphost:** import swagger extension ([88e1615](https://github.com/fenrick/MiroDiagramming/commit/88e1615749a6b8c80d0135377b7b63346e785f02))
* **app:** prefix custom event ([96e73d1](https://github.com/fenrick/MiroDiagramming/commit/96e73d16e383e25a49d777c27cbd41fdba3b8445))
* attempt to fix ci pipeline ([a437490](https://github.com/fenrick/MiroDiagramming/commit/a437490e7c4394a78531c7b292b748d039a76016))
* **auth:** harden auth router ([fd199ef](https://github.com/fenrick/MiroDiagramming/commit/fd199ef584636ab1b74e758f0bc1ee4c1a50d431))
* **auth:** use design-system components in auth banner ([a664f1b](https://github.com/fenrick/MiroDiagramming/commit/a664f1b0ff46005edf894ae9e02087fc8a093cb3))
* **auth:** use secure random generator ([a92257d](https://github.com/fenrick/MiroDiagramming/commit/a92257d71ecdce3f67f411289fd0da24f52c36e1))
* **backend:** log idempotency purge errors ([8cc2bdc](https://github.com/fenrick/MiroDiagramming/commit/8cc2bdce158435330265668bc9e873976673ffab))
* **backend:** redirect root to static index ([80e7c88](https://github.com/fenrick/MiroDiagramming/commit/80e7c88bae10310099da6b40495852f0d96ad774))
* **board:** cache newly created tags ([4f56441](https://github.com/fenrick/MiroDiagramming/commit/4f56441afc6d352958cf48a2a38379c834d25de6))
* **board:** defer widget sync during resize ([38f46ae](https://github.com/fenrick/MiroDiagramming/commit/38f46aee47abfb9876afc4159b831c5d8e5b53fa))
* **board:** defer widget sync during resize ([28785a9](https://github.com/fenrick/MiroDiagramming/commit/28785a95bb77828f58c94cfddd62d4b09c9da8df))
* **board:** remove redundant type assertion ([634e6bb](https://github.com/fenrick/MiroDiagramming/commit/634e6bb3f8cc17c7aff10882cdeb8ed691987b48))
* **board:** remove redundant type assertion ([faa912e](https://github.com/fenrick/MiroDiagramming/commit/faa912eb9975f4e3a063cfcac73d6097830a5616))
* BREAKING CHANGE downgrade react add miro-design-system ([d085411](https://github.com/fenrick/MiroDiagramming/commit/d085411e6dde9160840d5d16ce71bb0efbfd3cc5))
* **build:** resolve vite path and logging errors ([b0ccbd6](https://github.com/fenrick/MiroDiagramming/commit/b0ccbd6c72cb209b084d88e2b28f460bb9059066))
* **build:** restore OpenTelemetry and test imports ([3d9a4b8](https://github.com/fenrick/MiroDiagramming/commit/3d9a4b8a06cf8649c9fc2367d3fb4635e9ab8301))
* change to istanbul ([af68f54](https://github.com/fenrick/MiroDiagramming/commit/af68f54de6b725f64810630b7aa48c362f7a921c))
* ci updates ([66aa13b](https://github.com/fenrick/MiroDiagramming/commit/66aa13bfb7155f35d9adffc8c881a2e3100dd557))
* ci.yml ([86a34b7](https://github.com/fenrick/MiroDiagramming/commit/86a34b7e762b73ea3d0df71f7c22e042310294bd))
* ci.yml ([ec520d9](https://github.com/fenrick/MiroDiagramming/commit/ec520d9fc893796bc44551ffe9bca3b78b92518a))
* **ci:** cache paths use client package ([f9ce402](https://github.com/fenrick/MiroDiagramming/commit/f9ce40229b7787c1152e3f52cf61cc65fc073b96))
* **ci:** checkout repo before merging coverage ([452e550](https://github.com/fenrick/MiroDiagramming/commit/452e550f146dd1ada8a7fa2d52593f0837c43b18))
* **ci:** copy dotnet coverage reliably ([5fa758f](https://github.com/fenrick/MiroDiagramming/commit/5fa758fc349265938139cf99f1aed6937b2492be))
* **ci:** create coverage dir before merging ([bedf927](https://github.com/fenrick/MiroDiagramming/commit/bedf927200abaf42c2425d02558ae2fec4b33289))
* **ci:** debug coverage merge ([8b38dea](https://github.com/fenrick/MiroDiagramming/commit/8b38dea005254e01644a656fb51414abc05f02e5))
* **ci:** escape coverlet threshold argument ([09f10f3](https://github.com/fenrick/MiroDiagramming/commit/09f10f335224cfaefb759a67e5246c1da0b02a7a))
* **ci:** inline sonar scan settings ([396f196](https://github.com/fenrick/MiroDiagramming/commit/396f196c2f9b955a5bebba57419006258616f748))
* **ci:** preserve coverage shards ([753c185](https://github.com/fenrick/MiroDiagramming/commit/753c1859905efe4ae97b7684a2e061c8425f088c))
* **ci:** remove coverage gating ([93b8892](https://github.com/fenrick/MiroDiagramming/commit/93b8892af875233ddd4dce63e16e9e2850a957d6))
* **ci:** restore server project ([851aa07](https://github.com/fenrick/MiroDiagramming/commit/851aa07468133fe48f349c2b0e745ffa10080b80))
* **ci:** specify project for sonar scan ([77120a5](https://github.com/fenrick/MiroDiagramming/commit/77120a504e990357d269db44773370b55eb06852))
* cleanup ([7bb748c](https://github.com/fenrick/MiroDiagramming/commit/7bb748c253bb8225d2ea0cdb01d3ea7f7525a349))
* cleanup ([f22570e](https://github.com/fenrick/MiroDiagramming/commit/f22570e811b9a1d0aac8fd187061ac2e840f2ab7))
* cleanup ([98c1092](https://github.com/fenrick/MiroDiagramming/commit/98c10924da453b90a5d71fe5aee82ec2bddf373f))
* cleanup divs ([56603c2](https://github.com/fenrick/MiroDiagramming/commit/56603c20d93d262551140e429f36822e0f04f5a9))
* cleanup divs ([4be8a9a](https://github.com/fenrick/MiroDiagramming/commit/4be8a9ad15a38b3f0090f065138a6bf652a89ad9))
* **client:** add react runtime deps ([850cac4](https://github.com/fenrick/MiroDiagramming/commit/850cac4b0cd223ab0e429a5cbfbbcdfccd174416))
* **client:** guard against missing Miro SDK ([68de42c](https://github.com/fenrick/MiroDiagramming/commit/68de42c9a738e0031e6093b80b6d5d80800e0def))
* **client:** handle errors in HttpLogSink ([9946ada](https://github.com/fenrick/MiroDiagramming/commit/9946adad680751ca03acae1ccb3e755b6e1e4da2))
* **client:** prefix job polling with api path ([a0bd139](https://github.com/fenrick/MiroDiagramming/commit/a0bd139e1bd65124c118518e92d64d415bf38201))
* **client:** proxy OAuth endpoints and retain api path ([74e9730](https://github.com/fenrick/MiroDiagramming/commit/74e97305abf4ac20129c77952eb41887a947b3b5))
* **client:** remove duplicate React plugin import ([738f963](https://github.com/fenrick/MiroDiagramming/commit/738f963c0b037ccfd4d062c5f6212e3f9be2f253))
* **client:** restore lint-compliant code ([a4b9471](https://github.com/fenrick/MiroDiagramming/commit/a4b94712f9089fcab364c111b92d37c5c77f11a9))
* **client:** validate regex safety ([cb18631](https://github.com/fenrick/MiroDiagramming/commit/cb18631625fa8fe643f3117aa2eee8c244703a9e))
* **client:** warn when Miro SDK missing ([fca3b64](https://github.com/fenrick/MiroDiagramming/commit/fca3b646af5ccffef849172aa8ea22c3c6f154b0))
* code cleanup ([42e7c9b](https://github.com/fenrick/MiroDiagramming/commit/42e7c9b46ca6c4096bf0bc9508b1e3496697a0ab))
* code cleanup ([5043473](https://github.com/fenrick/MiroDiagramming/commit/50434730ad765aa2858b9fbee2985080e497aa7c))
* code layout ([eb80fae](https://github.com/fenrick/MiroDiagramming/commit/eb80fae1f4d163affc2f9bcbd5f4fdb45d13d4ad))
* codeql ([be58a90](https://github.com/fenrick/MiroDiagramming/commit/be58a907da95298d9edf8ab1d4ce56712890a7e6))
* **components:** remove void expressions ([c0c8f8f](https://github.com/fenrick/MiroDiagramming/commit/c0c8f8f97ffa50ca9034ee9b3efbfc1e23d2081a))
* **components:** remove void expressions ([ee303a6](https://github.com/fenrick/MiroDiagramming/commit/ee303a646d898ebd4502926d749cb1f4fed2d79a))
* **config:** align OAuth redirect env var ([2e1e1e7](https://github.com/fenrick/MiroDiagramming/commit/2e1e1e784e9119a9e4fe8638c78498c4173ca7b5))
* **config:** remove duplicate OAuth keys and clarify CORS ([100ccf7](https://github.com/fenrick/MiroDiagramming/commit/100ccf7595d8d61e3bb235675fafefeaac13c512))
* **core:** improve excel loader and UI ([0ad24d4](https://github.com/fenrick/MiroDiagramming/commit/0ad24d4bfe0aaf3f8fc4b435c0a30e733146bab7))
* **core:** improve utils and accessibility ([23ab21c](https://github.com/fenrick/MiroDiagramming/commit/23ab21c88e2ac9000e76d816201326fc615caae6))
* **core:** replace xlsx with exceljs ([2057eed](https://github.com/fenrick/MiroDiagramming/commit/2057eed2e257167c640bb9bf5b37055682c1f2fc))
* **core:** resolve lint issues and break board cache cycle ([1b35026](https://github.com/fenrick/MiroDiagramming/commit/1b35026c7fae3b3b408ceb8295579d304cd1a709))
* **core:** sync board after creating all widgets ([6586529](https://github.com/fenrick/MiroDiagramming/commit/6586529987ce89ce9a9cd9078abf4f5c87c84daf))
* **core:** sync board after creating all widgets ([834868d](https://github.com/fenrick/MiroDiagramming/commit/834868d289723c258aaa9740dc30d2d74d01310d))
* coverage vs shards ([1d97345](https://github.com/fenrick/MiroDiagramming/commit/1d97345fc9f236f75a66f6bda5ac7a7eb6226a19))
* **crypto:** raise error on invalid tokens ([db9020f](https://github.com/fenrick/MiroDiagramming/commit/db9020f42df1bfb4832b83298439d9209ea83ed3))
* **crypto:** validate key and allow rotation ([b00a694](https://github.com/fenrick/MiroDiagramming/commit/b00a694ff96b740ed596379a6d8e1ce1677d91cd))
* **db:** load Alembic URL from environment ([97dee13](https://github.com/fenrick/MiroDiagramming/commit/97dee139f0dad4755297360edc6bd5fa58fd399b))
* **db:** mark foreign keys in jobs tables migration ([b982b88](https://github.com/fenrick/MiroDiagramming/commit/b982b8884ece677f6a302aa24c6718ef81550e01))
* debug line ([62b8dfe](https://github.com/fenrick/MiroDiagramming/commit/62b8dfe5c90b49f148aeabafa3b8f30c2fb407b4))
* dependabot broke package.json ([2b4ad84](https://github.com/fenrick/MiroDiagramming/commit/2b4ad8460e69fc8640c13f3d31ab2e5b75e7af2b))
* **deps:** add storybook blocks ([3a490dd](https://github.com/fenrick/MiroDiagramming/commit/3a490ddf9603b0f97319211281813267acfbb95a))
* **deps:** update dependency zustand to v5 ([6fd97cd](https://github.com/fenrick/MiroDiagramming/commit/6fd97cdba93a264591d2699477b81210ed96636f))
* **docs:** remove csf references ([96198ab](https://github.com/fenrick/MiroDiagramming/commit/96198ab7114992b12f77c9d04fb032a6b49cfa42))
* dotnet coverage ([339cf43](https://github.com/fenrick/MiroDiagramming/commit/339cf4350b60aa76966483866159652a7d759b3b))
* **dropzone:** hide file input and document usage ([613054b](https://github.com/fenrick/MiroDiagramming/commit/613054b09d55bebd00b51eeb11280048b6c118d9))
* **dropzone:** hide file input and document usage ([5488e04](https://github.com/fenrick/MiroDiagramming/commit/5488e0445231e94d8ad3f083bff3e7605c54cd7c))
* dupe imports ([8dfc4af](https://github.com/fenrick/MiroDiagramming/commit/8dfc4af2c14bff6aa50b6e24751024be17b7b3b3))
* dupe imports ([abacb5c](https://github.com/fenrick/MiroDiagramming/commit/abacb5cef4087e0ea4df5d42784780f51d997349))
* elk options ([f4126a6](https://github.com/fenrick/MiroDiagramming/commit/f4126a6657f510746ba9a9aad1099d4693f8d328))
* elk options ([03de17d](https://github.com/fenrick/MiroDiagramming/commit/03de17d78eedc43ca84848ec9e67331319802604))
* ensure upgradability ([11d2abd](https://github.com/fenrick/MiroDiagramming/commit/11d2abd92b2c03c195f335b3ee0113d9ec54768c))
* fenrick.miro.tests.csproj ([b5b42fa](https://github.com/fenrick/MiroDiagramming/commit/b5b42fa7ac21e809fdf2c9ad358b4c88579e19fc))
* fenrick.miro.tests.csproj ([84eba96](https://github.com/fenrick/MiroDiagramming/commit/84eba96ecc0ed04165247ae90a7c474041239449))
* for code scanning alert no. 13: Inefficient regular expression ([948e1ae](https://github.com/fenrick/MiroDiagramming/commit/948e1ae24bf039446ad47fc76931cc2036526ec9))
* form layout ([0fa7d65](https://github.com/fenrick/MiroDiagramming/commit/0fa7d6515d0153e95cfcca0a3297329350dc4690))
* format css ([5886005](https://github.com/fenrick/MiroDiagramming/commit/5886005268525d4f1a7076affbcd31790cd64561))
* format css ([1a883f7](https://github.com/fenrick/MiroDiagramming/commit/1a883f7d5ebf8fe438a7af5b8497e7d652d8d40c))
* formatting ([4110d7b](https://github.com/fenrick/MiroDiagramming/commit/4110d7bfc8238e3c1784ab0b022f22dd7a7a5227))
* formatting ([c132bab](https://github.com/fenrick/MiroDiagramming/commit/c132babd2b0e7159b3d5679ac31e7adb6a90703a))
* formatting ([e737831](https://github.com/fenrick/MiroDiagramming/commit/e7378317e9f2c523180bed2f135893e97cdff3ce))
* formatting ([0d0ab7a](https://github.com/fenrick/MiroDiagramming/commit/0d0ab7a0c7e085b4e521fc409e2aa4fb690f28b1))
* formatting and linting ([fafef8e](https://github.com/fenrick/MiroDiagramming/commit/fafef8edca010614260a8f91aa9fc93dc12ce2fc))
* formatting code ([06410fa](https://github.com/fenrick/MiroDiagramming/commit/06410fa9ada1dde59ad22c529905370897d5f28d))
* **graph:** sync nodes before connectors ([5e25a3c](https://github.com/fenrick/MiroDiagramming/commit/5e25a3c1667a7e74c3b70039f8fd2a9854ff3f64))
* **graph:** sync nodes before connectors ([eb61fd0](https://github.com/fenrick/MiroDiagramming/commit/eb61fd0e5e3ad8e37ed9d64d09b9e6acb01fcb33))
* hmmm ([9e4c57e](https://github.com/fenrick/MiroDiagramming/commit/9e4c57eae11590ec99cf88d892a16dcc52063c80))
* husky install deprecated ([cc2900b](https://github.com/fenrick/MiroDiagramming/commit/cc2900b1960f2b174b0678d7e6fdbbbcea3d0add))
* icons ([fa691df](https://github.com/fenrick/MiroDiagramming/commit/fa691df6d6361d6573b04e841e5241ba242a0049))
* icons ([6529f28](https://github.com/fenrick/MiroDiagramming/commit/6529f28e06a56e80f3469f467c7d688b9dd1403c))
* ignore coverage folder ([c1867ba](https://github.com/fenrick/MiroDiagramming/commit/c1867ba099863f77197758bb0b259142ebdd6886))
* ignore visual studio ([31df9b9](https://github.com/fenrick/MiroDiagramming/commit/31df9b9086bb5ece6598a34b300962e0f33d1692))
* ignores ([057af71](https://github.com/fenrick/MiroDiagramming/commit/057af719868a1dbfcecd5931905bc8712de56314))
* improve fill color fallback logic in style presets ([b3c50b6](https://github.com/fenrick/MiroDiagramming/commit/b3c50b61722f0d41f0782d84b1dab1e052e49e7c))
* incorect path ([0940b7e](https://github.com/fenrick/MiroDiagramming/commit/0940b7e8565571fcf6439aa2f856908bd10ac805))
* internal defaults ([0bb6de7](https://github.com/fenrick/MiroDiagramming/commit/0bb6de7dfe2c1e63b70067b86face823e0ea091e))
* internal defaults ([6851d87](https://github.com/fenrick/MiroDiagramming/commit/6851d871a111cc69f67f407686b81c92ef63eed9))
* javascript coverage?? ([4e735aa](https://github.com/fenrick/MiroDiagramming/commit/4e735aa0ca394cf70a5a1c6073075d74bb72d87b))
* **json-dropzone:** ensure hidden input triggers drop event ([c0bd21d](https://github.com/fenrick/MiroDiagramming/commit/c0bd21dec6d1e46cc896ba3dc178d7cf213107a1))
* **json-dropzone:** ensure hidden input triggers drop event ([86a23d9](https://github.com/fenrick/MiroDiagramming/commit/86a23d9d76aa3c8b895838b6f3885082435b85b4))
* just checks ([2a898ef](https://github.com/fenrick/MiroDiagramming/commit/2a898ef1a81c973677b49ed7899e4546c7310351))
* just checks ([468dbb1](https://github.com/fenrick/MiroDiagramming/commit/468dbb185aa20c6657133f8247c300cf5e49ba34))
* layout ([d1e8a6b](https://github.com/fenrick/MiroDiagramming/commit/d1e8a6b3eb590ed83b41f6cac087f4cb786addf4))
* layout ([3e11583](https://github.com/fenrick/MiroDiagramming/commit/3e11583f9a635609558ebca1f966a38e5d1464cf))
* layout corrections ([36bbdee](https://github.com/fenrick/MiroDiagramming/commit/36bbdeef2afcd4254c9c1b2da93772f5714db250))
* **layout:** skip spacer nodes in results ([97921f4](https://github.com/fenrick/MiroDiagramming/commit/97921f4fe93acaccf503374529cc3f6cede13e11))
* **layout:** use aspect ratio enums ([85f4213](https://github.com/fenrick/MiroDiagramming/commit/85f4213e7fe0650c47940901824b5673c57c972f))
* **layout:** use aspect ratio enums ([99c5424](https://github.com/fenrick/MiroDiagramming/commit/99c54248717da614d18f48a627ccd9ee0205cd42))
* lconv coverage ([fc0bea3](https://github.com/fenrick/MiroDiagramming/commit/fc0bea301bf10db8198cafa05b718b4ce46cb418))
* lcov paths. ([fa5db10](https://github.com/fenrick/MiroDiagramming/commit/fa5db10773d375e552477d283f7259f23fef8ab7))
* **limits:** report real change queue bucket fill ([1581665](https://github.com/fenrick/MiroDiagramming/commit/1581665029d8608d6b653cbb9f7cfcaee833fa0e))
* lints ([129fde9](https://github.com/fenrick/MiroDiagramming/commit/129fde901aa1271cc80bcba89c5bb945f88ded9f))
* lints ([dfbb7e2](https://github.com/fenrick/MiroDiagramming/commit/dfbb7e2ae8cf53d9ca752b8aa190632f10aa731b))
* lints ([4c45906](https://github.com/fenrick/MiroDiagramming/commit/4c4590678a5b42594931c44d82462a02de3a7073))
* lints ([190e15e](https://github.com/fenrick/MiroDiagramming/commit/190e15e4060837621ebbf403e06c4d559f0ed556))
* **logger:** remove redundant assertions ([e6ff119](https://github.com/fenrick/MiroDiagramming/commit/e6ff11980d40292ab25b0229676f3e68e8dfed7c))
* **logging:** enable console output in dev ([25e10b5](https://github.com/fenrick/MiroDiagramming/commit/25e10b57df32540a2345721539d3f471a48128eb))
* **logs:** cap log ingestion payload ([fd8fe97](https://github.com/fenrick/MiroDiagramming/commit/fd8fe975b4d053cee482bf87a9510ed4b9bcdc0f))
* make computePosition public and update tests ([ac94f09](https://github.com/fenrick/MiroDiagramming/commit/ac94f099ed0f886237adb3ea05deca0005df06d6))
* many fixes ([50e7931](https://github.com/fenrick/MiroDiagramming/commit/50e7931fe995bfbcbe8542dd87844646ca0b21a5))
* many fixes ([b990b6a](https://github.com/fenrick/MiroDiagramming/commit/b990b6ad4728787200ef2d50a063e5992fc7d3a4))
* merge commands ([317fc7e](https://github.com/fenrick/MiroDiagramming/commit/317fc7e8f61a6bf73679fe753c6ee4ef1abeec24))
* **miro_client:** reuse persistent async client ([f56db17](https://github.com/fenrick/MiroDiagramming/commit/f56db174377706f4ba64fb11d5aa5cb9a8c43236))
* **miro-client:** parse http-date Retry-After ([82c83cd](https://github.com/fenrick/MiroDiagramming/commit/82c83cde1bbed6c04e7134ed3aacc0611c776f0e))
* missing configuration ([2a26d0b](https://github.com/fenrick/MiroDiagramming/commit/2a26d0bf6ca68efb19d3a9ff44372d261f261a8f))
* **modal:** update tests to query accessible elements ([eb009e9](https://github.com/fenrick/MiroDiagramming/commit/eb009e9fc6e61f0ca1585b9c843169f764391b7c))
* more fixes ([d5f0d77](https://github.com/fenrick/MiroDiagramming/commit/d5f0d77ef0dbb9d3c05e8a4435eea4439e97cb22))
* move tests to right folder ([1d3bf67](https://github.com/fenrick/MiroDiagramming/commit/1d3bf67bf95f9579bfde296d42bb176503d65af5))
* move to component ([262ee16](https://github.com/fenrick/MiroDiagramming/commit/262ee16c0f08b10cbed0bd555283ad63540e4fb3))
* **oauth:** sign and validate oauth state ([e40111e](https://github.com/fenrick/MiroDiagramming/commit/e40111ef579cdc2006ad8a4dd88d7189507bccc5))
* omg so slow ([8766e9d](https://github.com/fenrick/MiroDiagramming/commit/8766e9d5709d11c78afbca870b8c3505fcb6be98))
* oops ([708000e](https://github.com/fenrick/MiroDiagramming/commit/708000e54a4cfb6ec695a0a45879d7858b078a5a))
* oops ([951d8df](https://github.com/fenrick/MiroDiagramming/commit/951d8df61f879da58575225bbb0f2408f61087fd))
* package dependencies ([206f2ab](https://github.com/fenrick/MiroDiagramming/commit/206f2ab0d8efec8c65a5c28c371b2e456b43410c))
* paragraph ([302fd21](https://github.com/fenrick/MiroDiagramming/commit/302fd217a6cb3f1672233872103163ddcd268c02))
* paragraph ([2782689](https://github.com/fenrick/MiroDiagramming/commit/2782689d83f0cfdb45de0d2742263d39aa7c24be))
* paths ([eaef620](https://github.com/fenrick/MiroDiagramming/commit/eaef620ad139cf036fbdd3007db3bf8958ffa972))
* prettier to ignore CHANGELOG.md ([0182fbf](https://github.com/fenrick/MiroDiagramming/commit/0182fbfe11eeb36a9ae9211462fba420a3cac727))
* pretty formatting ([bb1c57c](https://github.com/fenrick/MiroDiagramming/commit/bb1c57c969beadea652af0b47b6c4a5873929bb1))
* primitive.div ([1220699](https://github.com/fenrick/MiroDiagramming/commit/1220699dc1de6a2d394ccb60853150113bd1eda4))
* primitive.div ([fe1c2fe](https://github.com/fenrick/MiroDiagramming/commit/fe1c2fe650cb47c4ade716610014d9c5d4b58548))
* **prisma:** use real client types ([e0fe184](https://github.com/fenrick/MiroDiagramming/commit/e0fe184a7c6a07d61a2c65a382157b5f16e21a0f))
* project restructure breaking change ([897c7c1](https://github.com/fenrick/MiroDiagramming/commit/897c7c1e8ac7c3048f6881bba1f1242bc804f774))
* **queue:** claim persisted tasks lazily ([12817c7](https://github.com/fenrick/MiroDiagramming/commit/12817c75fdd3da9e7d6ab396708c878a15419017))
* **queue:** retry network connection errors ([f17df6c](https://github.com/fenrick/MiroDiagramming/commit/f17df6cda46fff9bc171f928f6f07ae8aa9fdfca))
* refactor node dimension resolution logic ([abb81b1](https://github.com/fenrick/MiroDiagramming/commit/abb81b1860b64e4eafdc12d01eb10d7af1b1a61d))
* refactor useDebouncedSearch destructuring in SearchTab ([2f55e6e](https://github.com/fenrick/MiroDiagramming/commit/2f55e6eea4249b8cd6b4f1bb8ef8a91af025179f))
* reformat ([915d2d4](https://github.com/fenrick/MiroDiagramming/commit/915d2d40b45beb5e035032fc71e363d15b37ea1a))
* reformat ([f3a366f](https://github.com/fenrick/MiroDiagramming/commit/f3a366f12cd17fb39c7b392f6dac78ac230f8816))
* regex ([5d8e6bb](https://github.com/fenrick/MiroDiagramming/commit/5d8e6bb62c0aab5221d893c7d9dcc934f435f9b2))
* remove commented code ([b80bd1e](https://github.com/fenrick/MiroDiagramming/commit/b80bd1e3aaecd62251613b350085481f7f9f32e6))
* remove commented code ([012e4a6](https://github.com/fenrick/MiroDiagramming/commit/012e4a6729411a5577bd7b8c81840a73d856c17e))
* remove to resolve mise ([cb8058b](https://github.com/fenrick/MiroDiagramming/commit/cb8058b81c8419c927d607b08ac2c5b8ab88a546))
* remove unnecessary eslint-disable-next-line complexity comments ([5ea14d8](https://github.com/fenrick/MiroDiagramming/commit/5ea14d8b1bddeb79147aebc7e04253998f54f4e3))
* rename tab ([3d07448](https://github.com/fenrick/MiroDiagramming/commit/3d074484587d8cca3583b3e3d2984d7d3b692d74))
* required for test ([62963ed](https://github.com/fenrick/MiroDiagramming/commit/62963ed006de3d5a076ffbd17e510c420428a2ec))
* restore 2 shards ([d70b3fb](https://github.com/fenrick/MiroDiagramming/commit/d70b3fb88d41af91171750b8fc6031fb67870ab0))
* revert to examples ([ca116eb](https://github.com/fenrick/MiroDiagramming/commit/ca116eb6cc7e883e1dd0e089c371375ca85ae736))
* revert to examples ([e3c8578](https://github.com/fenrick/MiroDiagramming/commit/e3c8578e08bd94d654f1adc1ec73872540479eb2))
* rider settings ([5a4a229](https://github.com/fenrick/MiroDiagramming/commit/5a4a229749c6288601bebf333ccae372cb2ddd30))
* run commands ([1c283dd](https://github.com/fenrick/MiroDiagramming/commit/1c283dd37551746cc75457bedc339dd5e49fcca2))
* **schemas:** forbid extra fields on input models ([f5b9bfb](https://github.com/fenrick/MiroDiagramming/commit/f5b9bfb055c4b69053e584d0bab84f12997f0ace))
* **schemas:** forbid unknown fields ([82638e2](https://github.com/fenrick/MiroDiagramming/commit/82638e263d870b3c41014bb78631863472061f3d))
* scrollable ([e2a9d96](https://github.com/fenrick/MiroDiagramming/commit/e2a9d9621a056f0c7ba5becb735458ab1cf794b3))
* scrollable ([4af5d17](https://github.com/fenrick/MiroDiagramming/commit/4af5d177ec95e68b28be0a9843f3cc15ac5897a2))
* scrollable window ([2e7d91d](https://github.com/fenrick/MiroDiagramming/commit/2e7d91d0de3015bf76c12405516e736e7225a069))
* **search:** correct filter dropdown handlers ([e78d2b6](https://github.com/fenrick/MiroDiagramming/commit/e78d2b671eb4c0f174da7867bd6e96a29d256944))
* **search:** correct filter dropdown handlers ([1099a6c](https://github.com/fenrick/MiroDiagramming/commit/1099a6c5bf26274a0fceb22e351a398f3c3867e0))
* **security:** validate regex patterns ([5745f0d](https://github.com/fenrick/MiroDiagramming/commit/5745f0d00403a51802526408e3a3a885ab20114c))
* Server.Tests.csproj ([890d5a8](https://github.com/fenrick/MiroDiagramming/commit/890d5a8334fcac4b263b907a79cf8e869df83d27))
* **server:** add missing usings and update tests ([b046dc4](https://github.com/fenrick/MiroDiagramming/commit/b046dc4196868a50eed557883c4d35e1646671c4))
* **server:** address analyzer warnings ([be77ba8](https://github.com/fenrick/MiroDiagramming/commit/be77ba865687b513fd765837d305985b945badaa))
* **server:** address analyzer warnings ([e98fbab](https://github.com/fenrick/MiroDiagramming/commit/e98fbaba9e5c052f7b918f66b9237c240ccfe363))
* **server:** address smells and improve tests ([9e07e55](https://github.com/fenrick/MiroDiagramming/commit/9e07e55f88526726ac1685ed61935b421d8d0489))
* **server:** annotate log entry and make Program static ([10b6d48](https://github.com/fenrick/MiroDiagramming/commit/10b6d48176e814d7a5dd8407f9d7646d6575f394))
* **server:** clean up imports and whitespace ([f2f39a0](https://github.com/fenrick/MiroDiagramming/commit/f2f39a0f556c0852457472bf28aa20c81f28b869))
* **server:** clean up using directives ([525d0c9](https://github.com/fenrick/MiroDiagramming/commit/525d0c90da5f7bbeca1cffca71089964cb6a536e))
* **server:** conform to naming rules ([3bf0a57](https://github.com/fenrick/MiroDiagramming/commit/3bf0a57c1977c966d078a154f77f006cf9bd5475))
* **server:** correct ExcelLoader usage ([9e22b34](https://github.com/fenrick/MiroDiagramming/commit/9e22b343b633b4d22d3624b3741e6b6b254189f0))
* **server:** dispose HTTP responses in client ([cb3df1d](https://github.com/fenrick/MiroDiagramming/commit/cb3df1d23c7ad68b2b8a6e4bd8f804716c03f559))
* **server:** dispose responses in MiroRestClient ([8532aa6](https://github.com/fenrick/MiroDiagramming/commit/8532aa645be510dca37d2ae02d1bf1ce32946235))
* **server:** dispose shape queue processor ([a2abf99](https://github.com/fenrick/MiroDiagramming/commit/a2abf99dfc797fd7cf6e44c2798224e7286784a2))
* **server:** enforce required data fields ([cbea5d1](https://github.com/fenrick/MiroDiagramming/commit/cbea5d106b3b07cc8a39e81a324fe854ba505f25))
* **server:** handle tag service errors ([55c4b01](https://github.com/fenrick/MiroDiagramming/commit/55c4b01fd4c92fc8f66b3258b4a0b4e6765706a4))
* **server:** make migrations optional for tests ([8786378](https://github.com/fenrick/MiroDiagramming/commit/878637845d3669d51c89d42e601eeb52d5a776e3))
* **server:** patch vulnerable packages ([e22dc1d](https://github.com/fenrick/MiroDiagramming/commit/e22dc1d7fb9ef5a4f97630ec4a760f8f222c9f8d))
* **server:** remove duplicate log sink registration ([685a231](https://github.com/fenrick/MiroDiagramming/commit/685a231e7ef298b1fc2f3f4d4eba37aa91b45416))
* **server:** remove redundant using directive ([4233af8](https://github.com/fenrick/MiroDiagramming/commit/4233af8da52f9880e968c827284ed20eae758ec2))
* **server:** resolve analyzer warnings ([5c44bb6](https://github.com/fenrick/MiroDiagramming/commit/5c44bb6b4fd2a3276de522cbe12c287844ac0993))
* **server:** resolve analyzer warnings ([1210cfe](https://github.com/fenrick/MiroDiagramming/commit/1210cfefc3fef8e1516829d192c2bf54e8f4af8c))
* **server:** switch to file-scoped namespaces ([2824363](https://github.com/fenrick/MiroDiagramming/commit/2824363d96a4254dfd219f5c9a9cc6d57e205f7b))
* **server:** validate tag board id and surface errors ([4a400c0](https://github.com/fenrick/MiroDiagramming/commit/4a400c01550cf5bfc2092726a178127456b1056c))
* set language ([b71b041](https://github.com/fenrick/MiroDiagramming/commit/b71b041f29a36d6352a89aba0679bae47b9b37b2))
* simplify fill color extraction in templateToPreset ([a04aeec](https://github.com/fenrick/MiroDiagramming/commit/a04aeecddeba1b33153638f786cde2aba3d906c7))
* single run ([04cf024](https://github.com/fenrick/MiroDiagramming/commit/04cf0249f8f8c444170ac2bf03a7eafec68ffac7))
* some formatting ([7be98ed](https://github.com/fenrick/MiroDiagramming/commit/7be98ed57c022522af0f574575911762ce3ed74b))
* some formatting ([70f069c](https://github.com/fenrick/MiroDiagramming/commit/70f069cddf16d63afd838fc89bad421974735142))
* spelling ([0ffd579](https://github.com/fenrick/MiroDiagramming/commit/0ffd5797747b66b42329908e5bc275eb59f078c6))
* **stories:** attach components in docs ([8387716](https://github.com/fenrick/MiroDiagramming/commit/8387716a58806650a0a5c5d3afd23a5a3872df62))
* **stories:** mark wrapper props readonly ([179b285](https://github.com/fenrick/MiroDiagramming/commit/179b2859be57827e7167e7f396a37977bfba435e))
* style ([c2535ef](https://github.com/fenrick/MiroDiagramming/commit/c2535efe2e8a4c84211bc02435c16bb5892cc0b2))
* style ([ff99344](https://github.com/fenrick/MiroDiagramming/commit/ff9934400852b20fcfd5ee48cb626b28f91fbc5b))
* style issues ([83533bf](https://github.com/fenrick/MiroDiagramming/commit/83533bf2d8a692ebfe9f79f615317a13b4b6cf16))
* **style-tab:** consolidate design system imports ([39b1fae](https://github.com/fenrick/MiroDiagramming/commit/39b1fae404bd2e19e1825f1944d127bbd8e84507))
* **style-tab:** consolidate design system imports ([0ff465e](https://github.com/fenrick/MiroDiagramming/commit/0ff465ecd9ff13d43cd5cd2fdaa7951fb13f75a4))
* **style:** add button type to StyleTab ([10e7a2e](https://github.com/fenrick/MiroDiagramming/commit/10e7a2e6e35b9dce9b9222b983a8af68d278aaa6))
* **style:** add missing semicolons ([c308fcb](https://github.com/fenrick/MiroDiagramming/commit/c308fcb48cf8761313d7e1ff4c9493aa70be5d20))
* styled buttons ([6ef0f99](https://github.com/fenrick/MiroDiagramming/commit/6ef0f99f0e09557b681076714f556673e44d7aea))
* styled buttons ([bad3a47](https://github.com/fenrick/MiroDiagramming/commit/bad3a471e45ded2359065f2ce281330c47ae12df))
* styles on storybook ([43e68ed](https://github.com/fenrick/MiroDiagramming/commit/43e68ed000063fe5dfc81803ecdfbee09b029379))
* styling ([d78df8d](https://github.com/fenrick/MiroDiagramming/commit/d78df8d409db07de9d88d28045791156cb424cc3))
* styling ([697036e](https://github.com/fenrick/MiroDiagramming/commit/697036e1b1f5c0cffc9559b1d27f88f4b5a1b99a))
* supposed to work ([0e71067](https://github.com/fenrick/MiroDiagramming/commit/0e710671922c0a2f3533b2486e3ab2c40309ed47))
* **sync-status-bar:** use apiFetch and map limits ([b05a0bc](https://github.com/fenrick/MiroDiagramming/commit/b05a0bcb65a2fecca8a431a298fd54dea29764be))
* **sync:** match shapes by text ([39effac](https://github.com/fenrick/MiroDiagramming/commit/39effacf504b4a25dabc2f966bf6b1298a83b787))
* **sync:** poll new limits endpoint ([1be109e](https://github.com/fenrick/MiroDiagramming/commit/1be109e9e8953bbccb01fdc5d6bc39a7d44609a6))
* **tabs:** adjust selectors and tests ([920e3e1](https://github.com/fenrick/MiroDiagramming/commit/920e3e1da7a9c47638cd0a101ead43fab029a7d1))
* templates updated ([1c184ed](https://github.com/fenrick/MiroDiagramming/commit/1c184ed55fe3c1291e384506c37fc3874f2aaf3a))
* templates updated ([2e9e3c1](https://github.com/fenrick/MiroDiagramming/commit/2e9e3c1ecc2075a310f8bdbbe4e066d0548ab63f))
* **templates:** parse border styles ([0f74d32](https://github.com/fenrick/MiroDiagramming/commit/0f74d32c69c8ad268d1c03f0477ca5d7fe759ee6))
* **templates:** parse border styles ([76d2b74](https://github.com/fenrick/MiroDiagramming/commit/76d2b744e2d496cb394ebec00186e5cbff3459da))
* **templates:** simplify token handling ([603dc01](https://github.com/fenrick/MiroDiagramming/commit/603dc0199881266cfbe22dac6076796b77a92295))
* **templates:** simplify token handling ([d89d9a8](https://github.com/fenrick/MiroDiagramming/commit/d89d9a828c32f6e30e7895f1152730cf9c4f5ac5))
* **tests:** add PointerEvent polyfill ([6ed6b10](https://github.com/fenrick/MiroDiagramming/commit/6ed6b10b627ba6a33135506eea8693fec89d307c))
* **tests:** address analyzer warnings ([779f48a](https://github.com/fenrick/MiroDiagramming/commit/779f48adc3956361db6bad89a3e8fb0fc2428868))
* **tests:** correct async context management ([f6bb14c](https://github.com/fenrick/MiroDiagramming/commit/f6bb14c081f1362c2a8647f78f9923752c66bd54))
* **tests:** generate coverage with coverlet ([77342c2](https://github.com/fenrick/MiroDiagramming/commit/77342c2f24f2d82be9806098e24b987bef5a6806))
* **tests:** remove dotnet dependency from auth integration ([6fc33f9](https://github.com/fenrick/MiroDiagramming/commit/6fc33f979a966516105a2cb2e46691fe3a9c574f))
* **tests:** remove orig variable and avoid state mocking ([0b6e357](https://github.com/fenrick/MiroDiagramming/commit/0b6e35710bd0c813e5191247501657c5ad68df11))
* **tests:** restore arrange-tab mocks ([eb3fdbf](https://github.com/fenrick/MiroDiagramming/commit/eb3fdbf14196f2f88556655da06ba100789878f8))
* **tests:** restore arrange-tab mocks ([a2a9384](https://github.com/fenrick/MiroDiagramming/commit/a2a9384c1c69b5a8060222eb9d2a65b41176f4d0))
* **test:** start log sink server ([91a88c1](https://github.com/fenrick/MiroDiagramming/commit/91a88c1405dd842c139c24f235215efdfb905167))
* tidy ([ea56888](https://github.com/fenrick/MiroDiagramming/commit/ea56888399d6498f6e30f7f6aa81b21b158fd672))
* tidy ([bb08af6](https://github.com/fenrick/MiroDiagramming/commit/bb08af6ed28081ecad1d5f61f2a60b08b2013ec0))
* **token-service:** recycle inactive locks ([b2b94c1](https://github.com/fenrick/MiroDiagramming/commit/b2b94c19381ebd660ee7f726d51f27498f772a05))
* **ui:** address failing tests ([3bdfe92](https://github.com/fenrick/MiroDiagramming/commit/3bdfe92a2252b59bea51b2a1064055f2558c674f))
* **ui:** address failing tests ([3b0614c](https://github.com/fenrick/MiroDiagramming/commit/3b0614caafd8a926baf072cae51fb1b88fef20d2))
* **ui:** apply consistent form spacing ([8cef5f1](https://github.com/fenrick/MiroDiagramming/commit/8cef5f120beb5849ee391460d5cb60d7932a08cd))
* **ui:** apply consistent form spacing ([717a997](https://github.com/fenrick/MiroDiagramming/commit/717a9977735c51984eb903d77fe6b6967b194672))
* **ui:** avoid className injection in TabGrid ([8d0db83](https://github.com/fenrick/MiroDiagramming/commit/8d0db83afefadfedb61830155d977139ed211a0c))
* **ui:** avoid className injection in TabGrid ([5e33b9b](https://github.com/fenrick/MiroDiagramming/commit/5e33b9b5f27ad6348a857f7a63264ed8c9ba247d))
* **ui:** avoid invalid props on styled components ([3a84ed2](https://github.com/fenrick/MiroDiagramming/commit/3a84ed2dc34a96961afb55acfa4da97901a5d1cf))
* **ui:** avoid invalid props on styled components ([8e7eb88](https://github.com/fenrick/MiroDiagramming/commit/8e7eb883174965f44bef8eea1e1c61012acef991))
* **ui:** enforce wrapper spacing ([3ba8b46](https://github.com/fenrick/MiroDiagramming/commit/3ba8b46b78637d55ee89212be6d4df349e65c4ee))
* **ui:** enforce wrapper spacing ([cfb3587](https://github.com/fenrick/MiroDiagramming/commit/cfb3587f1263ec4b18353794a92ecfb4f37b0997))
* **ui:** implement checkbox with design-system switch ([b9a7683](https://github.com/fenrick/MiroDiagramming/commit/b9a76830bd1ae2861498ea5627f760dd70e46283))
* **ui:** implement checkbox with design-system switch ([3a794ac](https://github.com/fenrick/MiroDiagramming/commit/3a794ace0c7076f1148b1fde8573f2e4d0714ea2))
* **ui:** refine input handling and paragraph spacing ([64356a6](https://github.com/fenrick/MiroDiagramming/commit/64356a68dcaec3985b21629e0e58749a8a6e4df6))
* **ui:** refine input handling and paragraph spacing ([2c06ac3](https://github.com/fenrick/MiroDiagramming/commit/2c06ac31144ea5ee788cd101fedba0b7f3f772d0))
* **ui:** remove dead modal handlers ([6cce053](https://github.com/fenrick/MiroDiagramming/commit/6cce0534d414fdca66f920511d141105086c4190))
* **ui:** remove metadata casts in row hook ([626dd29](https://github.com/fenrick/MiroDiagramming/commit/626dd29e53c6e7ba55e20905782f6a594727c031))
* **ui:** remove redundant dialog role ([026549b](https://github.com/fenrick/MiroDiagramming/commit/026549b51bdf6d852346e3a3a5a226f7d9d8e8e9))
* **ui:** remove style props from styled components ([a665c82](https://github.com/fenrick/MiroDiagramming/commit/a665c82aa413a404e551d6d532213848dc32f6e3))
* **ui:** remove style props from styled components ([b417b69](https://github.com/fenrick/MiroDiagramming/commit/b417b69c4e0be714a96bd60f61a3ee8da36ec9c6))
* **ui:** remove void operator usage ([532c2cd](https://github.com/fenrick/MiroDiagramming/commit/532c2cd98e91fb0e2c5cb6f9deed2ca6b7bf199b))
* **ui:** remove void operator usage ([043fe56](https://github.com/fenrick/MiroDiagramming/commit/043fe56986c6eb0e0a1a44cbe77fc168fa372a44))
* **ui:** resolve reported code smells ([c7b4670](https://github.com/fenrick/MiroDiagramming/commit/c7b4670f8ac471566137f4ef8243afee046df2e7))
* **ui:** resolve reported code smells ([a60096b](https://github.com/fenrick/MiroDiagramming/commit/a60096b021c97bab0201eabd0d4e4c79ef332a9a))
* **ui:** resolve template colors in style presets ([d1649bf](https://github.com/fenrick/MiroDiagramming/commit/d1649bf7b0a748ee134557fbd8a9cb37a33ae544))
* **ui:** resolve typecheck and test failures ([da9902c](https://github.com/fenrick/MiroDiagramming/commit/da9902ca164c04eab546d2f368cc57a23a6dec38))
* **ui:** resolve typecheck and test failures ([d6779be](https://github.com/fenrick/MiroDiagramming/commit/d6779be2dd5be364d967dd37b7d3c847c32b344e))
* **ui:** restore sidebar scroll and sticky actions ([c857fd8](https://github.com/fenrick/MiroDiagramming/commit/c857fd8575e2d777a6564b66896925ae9113aedd))
* **ui:** restore sidebar scroll and sticky actions ([f54a738](https://github.com/fenrick/MiroDiagramming/commit/f54a7380064046016d02faebeb89e7c489cdf685))
* **ui:** restore structured tab markup ([8e64a1e](https://github.com/fenrick/MiroDiagramming/commit/8e64a1e6d320ec5ca572c6f0bcd2b03eaa536def))
* **ui:** restore structured tab markup ([b8b34ab](https://github.com/fenrick/MiroDiagramming/commit/b8b34ab7f2aa207e381bb8f7e143b1fba08f71bc))
* **ui:** show selected sub tab ([88b1d41](https://github.com/fenrick/MiroDiagramming/commit/88b1d411f88ccd3d6a72ef5ed6f98ce72960cc03))
* **ui:** show selected sub tab ([06a8980](https://github.com/fenrick/MiroDiagramming/commit/06a8980727a1621dcd09ab76316bc2c18f6200d7))
* **ui:** simplify diagrams layout and checkbox ([e379124](https://github.com/fenrick/MiroDiagramming/commit/e37912442ff9d0cf89aa9814f0afa04a828cd89a))
* **ui:** simplify diagrams layout and checkbox ([155ae6c](https://github.com/fenrick/MiroDiagramming/commit/155ae6caeb6044f07e26ba5571f2ff4dedb131f0))
* **ui:** style button margin via design system ([1b1b2fa](https://github.com/fenrick/MiroDiagramming/commit/1b1b2fa9d74f192faf8edf7e686bdd4c14d399c0))
* **ui:** style button margin via design system ([59e1d53](https://github.com/fenrick/MiroDiagramming/commit/59e1d5384dbfc79d9a7a101dcf4298a902b5525c))
* **ui:** trigger drop handler via hidden input ([89740d4](https://github.com/fenrick/MiroDiagramming/commit/89740d401a452b560c256385d1b264fec9395197))
* **ui:** trigger drop handler via hidden input ([7f6d783](https://github.com/fenrick/MiroDiagramming/commit/7f6d78302d6e01720fcf6fadfb7fa585e30ba6bd))
* **ui:** trigger upload processing ([08466e9](https://github.com/fenrick/MiroDiagramming/commit/08466e90d6ee5ae63d94fd292eaedc704f014ae9))
* **ui:** trigger upload processing ([3a8fb55](https://github.com/fenrick/MiroDiagramming/commit/3a8fb551005987f7d7b5abf98b35db23b2d36128))
* **ui:** update component comments and use design system ([15beb5f](https://github.com/fenrick/MiroDiagramming/commit/15beb5fbf3d2b939ffd8fd860a597d6196dc6885))
* **ui:** update component comments and use design system ([7f8e32a](https://github.com/fenrick/MiroDiagramming/commit/7f8e32a9aafcd69c53ca0b040f8f01a071520e53))
* **ui:** update form styles and intro text ([8346371](https://github.com/fenrick/MiroDiagramming/commit/834637180bba71c27834e69d969ac69ef5d9feee))
* **ui:** update form styles and intro text ([ecccc88](https://github.com/fenrick/MiroDiagramming/commit/ecccc887c825a086ffc8efd7b3868ca982e82004))
* **ui:** update segmented control imports ([1e651ce](https://github.com/fenrick/MiroDiagramming/commit/1e651ce2457d8d9d859aaea6c4eb3c798eb0fb7c))
* **ui:** update segmented control imports ([911ee77](https://github.com/fenrick/MiroDiagramming/commit/911ee77c4f2276701923b813afaf3addf3ebb1bf))
* unnecessary ([26c198a](https://github.com/fenrick/MiroDiagramming/commit/26c198a6fc4ba021e5e58575d87aeffe6faa4142))
* unnecessary ([f7f0f2d](https://github.com/fenrick/MiroDiagramming/commit/f7f0f2d678d70f919631afb7441d7da092a09343))
* update app.tsx ([99d17ca](https://github.com/fenrick/MiroDiagramming/commit/99d17cabc432ab4af2ff8c6c62e2744bbb4f275a))
* update app.tsx ([78c00a4](https://github.com/fenrick/MiroDiagramming/commit/78c00a4a86815d0c5735c9a51dec81ba5485c7be))
* update package.json ([abbaaa5](https://github.com/fenrick/MiroDiagramming/commit/abbaaa52ae066f9318a556e429dc85f57dba354d))
* update packages ([1bc4dcf](https://github.com/fenrick/MiroDiagramming/commit/1bc4dcfcd12e563540ae15ce214554e124ec52db))
* update packages ([b69b6ec](https://github.com/fenrick/MiroDiagramming/commit/b69b6ec7e120539a7ca3e6d2e6f0aa987355cddd))
* update versions ([659d78d](https://github.com/fenrick/MiroDiagramming/commit/659d78d474c883e20d66ea5525c20a44aa3a43d9))
* **utils:** avoid regex backtracking in base64 encoding ([48291d8](https://github.com/fenrick/MiroDiagramming/commit/48291d80e92cab88e2410d34540acc1158d4c8a9))
* **utils:** improve safe string conversion ([8c140dd](https://github.com/fenrick/MiroDiagramming/commit/8c140dd141056c7df0dbbc83b9b363d13c047999))
* valueOrDefault to use nullish coalescing ([ac16fc1](https://github.com/fenrick/MiroDiagramming/commit/ac16fc1ee852560282c34050740ac8f846718e7c))
* **web:** proxy oauth requests in Vite dev server ([0517863](https://github.com/fenrick/MiroDiagramming/commit/0517863e180038402c853e21e318e2820c804093))
* **web:** render sync status bar ([ba5053f](https://github.com/fenrick/MiroDiagramming/commit/ba5053fe99df920e51d2954eac2d36b6f6552fb7))
* **web:** use VITE_BACKEND_URL everywhere ([380a0b9](https://github.com/fenrick/MiroDiagramming/commit/380a0b9fc44d63f5d6abc0f66cb0214f1a82e326))
* **workflows:** adjust triggers for branches ([6344b4b](https://github.com/fenrick/MiroDiagramming/commit/6344b4b576ff05f61107b2f900d538c3bd5e46e5))
* wrong directory? ([5f1a0a3](https://github.com/fenrick/MiroDiagramming/commit/5f1a0a3fecb643537b529b8ee6ff8efdc08476ee))


### Features

* add job and idempotency models ([c45ec06](https://github.com/fenrick/MiroDiagramming/commit/c45ec06ba4b4b5425854112fda8fb666ddf30005))
* add sync status bar ([2621675](https://github.com/fenrick/MiroDiagramming/commit/262167591e3fc21986c9fd3e7c5d3c5777838376))
* **api:** add /api/boards/:boardId/tags, /api/cache/:boardId, and /api/limits; wire routes; Prisma idempotency migration generated earlier ([6caa428](https://github.com/fenrick/MiroDiagramming/commit/6caa428d207b98f1467ca1c7c84c4315ed3a2f55))
* **api:** add /api/webhook stub (202) and register route ([89df3a8](https://github.com/fenrick/MiroDiagramming/commit/89df3a8e18285fe314198d1687191f304021ce43))
* **api:** add oauth login and callback endpoints ([f6de3b7](https://github.com/fenrick/MiroDiagramming/commit/f6de3b7a628cbacf76767fa812ce29e4e84c8299))
* **api:** add webhook endpoint ([eda8cdd](https://github.com/fenrick/MiroDiagramming/commit/eda8cdd8106397b4dc2fa3fd27fc7661cb78e8af))
* **app:** add tooltips to tab labels ([2e5358a](https://github.com/fenrick/MiroDiagramming/commit/2e5358a307b7e177227b4372a70a359cb4d5a95c))
* **auth:** add /oauth/login and /oauth/callback aliases for client compatibility ([cf21983](https://github.com/fenrick/MiroDiagramming/commit/cf2198316dd47ce495e0e70d6e58737bcff62365))
* **auth:** add generated user schema ([10942f9](https://github.com/fenrick/MiroDiagramming/commit/10942f90805fa3087551e14de00ca1f927fb3389))
* **auth:** add OAuth routes with Miro Node client; Prisma-backed token storage; Prisma client bootstrap; lazy Miro init to keep tests green ([8788928](https://github.com/fenrick/MiroDiagramming/commit/8788928f66c1197c3975c8af47c4ae04030ec648))
* **auth:** retry registration with backoff ([60f01b7](https://github.com/fenrick/MiroDiagramming/commit/60f01b73750baa330e0514879d3d8efd13d3424b))
* **backend:** add token refresh service ([b78472f](https://github.com/fenrick/MiroDiagramming/commit/b78472fd4bf0d21e04c914e7a77f442f60a93a11))
* **batch:** add batch API endpoint ([6e7c3dd](https://github.com/fenrick/MiroDiagramming/commit/6e7c3dd6133f843ae71aa030b6de5702a4a20ea3))
* **batch:** add idempotency handling and tests ([87956c0](https://github.com/fenrick/MiroDiagramming/commit/87956c0a900ed69a885a71cb66578e2a518e63ee))
* **batch:** add ttl cache for idempotent responses ([d55baee](https://github.com/fenrick/MiroDiagramming/commit/d55baee89363592f4f5b564ccabfb213dda159c6))
* **batch:** limit batch operations ([a565464](https://github.com/fenrick/MiroDiagramming/commit/a565464924a28af984edbce02a25663a327958db))
* **batch:** support idempotent batch requests ([416ab9d](https://github.com/fenrick/MiroDiagramming/commit/416ab9d76a7bd9ed46a3988ae457892128954314))
* **batch:** track job outcomes ([e279fdd](https://github.com/fenrick/MiroDiagramming/commit/e279fdde3db0eca3e6cdccf9a8955759688b7053))
* **board:** add batch transaction support ([e226045](https://github.com/fenrick/MiroDiagramming/commit/e2260451a046bf825f5727480754dc3fc1fe354d))
* **board:** add cached board loader ([093440c](https://github.com/fenrick/MiroDiagramming/commit/093440c2cb95aefe7a0f20e121d9da038e33f069))
* **board:** extract shape style builder ([3ceb02b](https://github.com/fenrick/MiroDiagramming/commit/3ceb02b96f1895941157c4353f7afc906af36b6a))
* **board:** refactor token resolution helpers ([426bb08](https://github.com/fenrick/MiroDiagramming/commit/426bb08266578efa30d2de706b7e3072bbc67e54))
* **build:** add local CI script ([c1d4bb7](https://github.com/fenrick/MiroDiagramming/commit/c1d4bb7a6799a5f28a4ab6174d74fa898635c34c))
* **cache:** add ttl and size cap to shape cache ([ebbce62](https://github.com/fenrick/MiroDiagramming/commit/ebbce62ee9710a32e50d430d2e9ba4e65ce67c02))
* **cache:** expose board cache router ([86b5492](https://github.com/fenrick/MiroDiagramming/commit/86b5492981ac9953de54d52d8d1ba7f631175a3f))
* **cache:** reuse selection in builder ([2f7c187](https://github.com/fenrick/MiroDiagramming/commit/2f7c187a2900d6a917e9fa60ef2d82cc73f87e0c))
* **cache:** schedule cache cleanup task ([1c4ae64](https://github.com/fenrick/MiroDiagramming/commit/1c4ae6437d0155ad7f7fcd87309e4414326cea96))
* **cards:** add idempotency support via Prisma; defer worker in tests; wire accepted count to idempotency key; schema migration (create-only) ([fc0d2a5](https://github.com/fenrick/MiroDiagramming/commit/fc0d2a542da761b33a20d4185f883f2d1669b2b8))
* **cards:** implement /api/cards with in-memory queue + background worker; add MiroService to create cards via REST when boardId provided; wire routes and start queue ([2eb708b](https://github.com/fenrick/MiroDiagramming/commit/2eb708b4b2cee89f9f6f9a0a26c762c9fd44d748))
* **cards:** queue card creation tasks ([17ad13f](https://github.com/fenrick/MiroDiagramming/commit/17ad13ffea8dd71c72bdd4ee8772e841c4ba737f))
* **client:** add job drawer and job polling hook ([1359ab1](https://github.com/fenrick/MiroDiagramming/commit/1359ab14ffd977e6bd5320d5c449bbca7c01e25d))
* **client:** batch apply board changes ([62b8a19](https://github.com/fenrick/MiroDiagramming/commit/62b8a196a28c814cfb546fc428ba094104df3a53))
* **client:** generate API client types during build ([3cf467c](https://github.com/fenrick/MiroDiagramming/commit/3cf467c39ef86f5fb9959558a4e0c15a35d04a07))
* **client:** replace checkbox with design system component ([8bdd35f](https://github.com/fenrick/MiroDiagramming/commit/8bdd35f5fc3037488332254d33f3944a456fb85b))
* **config:** create default config files ([71ca1e3](https://github.com/fenrick/MiroDiagramming/commit/71ca1e3684c43a52975a80f41a356a3fd406051b))
* **core:** add centralized logger ([baf11dd](https://github.com/fenrick/MiroDiagramming/commit/baf11dd2ea5ef448afbf9a7cc55b65f822a5e14f))
* **core:** add example config and tests ([1aec5a2](https://github.com/fenrick/MiroDiagramming/commit/1aec5a25be490572db9eea1bdba286741c63bed9))
* **core:** add oauth config and timeout ([01af4e1](https://github.com/fenrick/MiroDiagramming/commit/01af4e1de0e3643240b1ea387f7cd907679c04c6))
* **core:** add optimistic ops hook ([c520423](https://github.com/fenrick/MiroDiagramming/commit/c520423874ee840c7922dac38d4cfc3ef4e1fb8a))
* **core:** add telemetry events ([22723ba](https://github.com/fenrick/MiroDiagramming/commit/22723ba34633b9692ab51b15cdd4e79ffcc18b80))
* **core:** expose limiter knobs ([c1bb18e](https://github.com/fenrick/MiroDiagramming/commit/c1bb18e5376405564754cea943c76c0eae727e41))
* **core:** load exceljs from cdn ([f831358](https://github.com/fenrick/MiroDiagramming/commit/f8313585373c9e111d94e300e0de952c970bce2a))
* **core:** refactor data mapper helpers ([9e036ab](https://github.com/fenrick/MiroDiagramming/commit/9e036abd0799991016d229dfa97c446c3fe67646))
* **core:** refactor excel sync service ([be3649d](https://github.com/fenrick/MiroDiagramming/commit/be3649df69464b06ceea143d19d16cea08088303))
* **core:** support connector alias lookup ([f564d05](https://github.com/fenrick/MiroDiagramming/commit/f564d05655a0dbd430202f6b4303ecac03de523f))
* **db:** add initial migration and smoke test ([b656d59](https://github.com/fenrick/MiroDiagramming/commit/b656d59bf59638b8167817bde40a00c69aafd007))
* **db:** add jobs boards shapes tags tables ([fef3532](https://github.com/fenrick/MiroDiagramming/commit/fef3532758ae8447cdc3005dc2108ac4a2d0af82))
* **db:** migrate status columns to enums ([75fb913](https://github.com/fenrick/MiroDiagramming/commit/75fb9132bad148b9386cf0b56b4403c53885fe99))
* **debug:** add developer query toggles ([aadaca6](https://github.com/fenrick/MiroDiagramming/commit/aadaca65ad79a5aad9c69579e3af6fed7f468f22))
* **dev:** add robust local start script and Compose entrypoint ([caa7946](https://github.com/fenrick/MiroDiagramming/commit/caa794693d4cb9b32768c088eb4ad1d59658cf6d))
* **dev:** single-process dev via Fastify + Vite middleware; add @fastify/middie; type-safe Miro token storage; update scripts for one-app dev ([de8cc75](https://github.com/fenrick/MiroDiagramming/commit/de8cc75274258ac363fc2ee29c598cf100cc8a54))
* **docker:** add FastAPI container and compose stack ([27a5fef](https://github.com/fenrick/MiroDiagramming/commit/27a5feffa756416760959184482d0d0768bb76e1))
* **docs:** add storybook config and stories ([9c9313b](https://github.com/fenrick/MiroDiagramming/commit/9c9313b470ce1b47672ff34b1410f7975ddf067c))
* **docs:** add storybook config and stories ([ef58773](https://github.com/fenrick/MiroDiagramming/commit/ef587733ba8bcb6f0a9268983855ef3def3bf33d))
* **frontend:** add diff apply job flow ([f889560](https://github.com/fenrick/MiroDiagramming/commit/f889560a62bfb6c2107b699c9cbb5d16469c9dbf))
* **frontend:** add sticky-note [tag] assigner with cached tag creation\n\n- Add applyBracketTagsToSelectedStickies to parse [tags], ensure/create tags once per run,\n  assign to selected stickies, and strip bracketed text only on success\n- Add button to Arrange tab: "Apply [tags] to Stickies" ([07d80f8](https://github.com/fenrick/MiroDiagramming/commit/07d80f8d693263a7c9e0db266cf0d7b8b84322d8))
* **graph:** support hierarchical file import ([32ca989](https://github.com/fenrick/MiroDiagramming/commit/32ca989310f34779a2e79a1abf10369c83ec4b82))
* **host:** add AppHost with static UX files ([e45275d](https://github.com/fenrick/MiroDiagramming/commit/e45275d34c57e8510697ecb89bcd7a7fea32e2e3))
* **idempotency:** prune stale keys ([64f26c8](https://github.com/fenrick/MiroDiagramming/commit/64f26c89735bfc487e47dd9765093a56957ac7ee))
* **idempotency:** schedule cleanup task ([8e16d1f](https://github.com/fenrick/MiroDiagramming/commit/8e16d1f57dba6d0bbf0992c9436f94fff3cd7f5d))
* include user context in queued tasks ([c84a1e4](https://github.com/fenrick/MiroDiagramming/commit/c84a1e480fe276263561a616a2fa5c3de5774d1d))
* initial design-system ([f587cfc](https://github.com/fenrick/MiroDiagramming/commit/f587cfcd0c9b8d2f5761a4a78dba4c2b70162bc6))
* initial design-system ([c6a9e23](https://github.com/fenrick/MiroDiagramming/commit/c6a9e2309c46b796a572732eb70e58e60b23b734))
* instrument SQLite persistence ([ce11108](https://github.com/fenrick/MiroDiagramming/commit/ce111084111741d7f99596cccf80fc5a0e9a718d))
* **layout:** add recursive ELK preprocessor ([f6fb909](https://github.com/fenrick/MiroDiagramming/commit/f6fb9093cd6a1e77bfbfa1df021b3c976f79ef69))
* **layout:** extract dimension helper ([8e6277e](https://github.com/fenrick/MiroDiagramming/commit/8e6277e429c6ac924682343a27e4698ecd6f1e0a))
* **layout:** integrate elk preprocessor and options ([cc63c53](https://github.com/fenrick/MiroDiagramming/commit/cc63c53e9f6335efca85b022ec5ad4cfd943dbc7))
* **logging:** add debug logs for board cache and utilities ([97da937](https://github.com/fenrick/MiroDiagramming/commit/97da93757636bc9ae713a4854d52af8f5143e141))
* **logging:** add info debug trace logs ([bcb2244](https://github.com/fenrick/MiroDiagramming/commit/bcb224472c03321471de79572edc75225fd15a0b))
* **logging:** forward client logs ([f9b5507](https://github.com/fenrick/MiroDiagramming/commit/f9b55071c6c6f7b51a73053d7241c24a6feb78a8))
* **logging:** instrument cache with pino ([a3798f4](https://github.com/fenrick/MiroDiagramming/commit/a3798f449b3f4e9881c0f358d73a21b0bf291c0e))
* **logging:** instrument logic with logfire ([475a2de](https://github.com/fenrick/MiroDiagramming/commit/475a2de0f3806c3468eaf3e11d9a8c5e1a0f52c8))
* **logs:** add client log ingestion endpoint ([62d66e5](https://github.com/fenrick/MiroDiagramming/commit/62d66e5e7c44a28c91573c7fc1ada52f74b1f96d))
* **logs:** enforce request body size limit ([e20d43a](https://github.com/fenrick/MiroDiagramming/commit/e20d43ae5ed56818bcf09325208ac67fe82d4e32))
* **logs:** make log batch limits configurable ([9fc1520](https://github.com/fenrick/MiroDiagramming/commit/9fc1520b88eed52d969ecad0d8a786120509783b))
* **metrics:** add log ingestion metrics ([7113768](https://github.com/fenrick/MiroDiagramming/commit/7113768762f0bd7b0723cc8cb86e961aae4339c7))
* migration to design-system ([472e169](https://github.com/fenrick/MiroDiagramming/commit/472e1698cc67480ecf24aa14b96a68bfc2762969))
* migration to design-system ([9c178d6](https://github.com/fenrick/MiroDiagramming/commit/9c178d6dd5a78837ab2f089e3274256f876b1f9a))
* **miro-client:** add refresh token stub ([4047dc0](https://github.com/fenrick/MiroDiagramming/commit/4047dc08c25013f80a8f3a44b095ae101ed362fb))
* **miro-client:** raise typed HTTP errors ([ac45fc2](https://github.com/fenrick/MiroDiagramming/commit/ac45fc240e300e66c46411795e6beed3aa31b47b))
* nodejs project ([1d78987](https://github.com/fenrick/MiroDiagramming/commit/1d78987be58cb9a0f3f60ccb0da5ce0045620225))
* **oauth:** encrypt persisted tokens ([1b49795](https://github.com/fenrick/MiroDiagramming/commit/1b4979501f9c5c565e932179f301d561cdeddd8a))
* **oauth:** expand OAuth configuration ([f101889](https://github.com/fenrick/MiroDiagramming/commit/f1018894d03ad28a640e345bb7ef3d57d6076179))
* **oauth:** persist tokens in database ([da0ac15](https://github.com/fenrick/MiroDiagramming/commit/da0ac152516a495726c87b2a89f0698095e9e04e))
* **observability:** expose metrics and telemetry ([0a15167](https://github.com/fenrick/MiroDiagramming/commit/0a15167ddba53b5be49ff1fe49fa270757547513))
* **openapi:** add server metadata and examples ([07ee4bd](https://github.com/fenrick/MiroDiagramming/commit/07ee4bd532ed59c14d325f427b94d4b4f47804bc))
* **prisma:** add tag uniqueness index ([b4ea829](https://github.com/fenrick/MiroDiagramming/commit/b4ea829b0f9a4a9ca712ac1d762571c81008710c))
* **queue:** add change queue and persistence ([f28444b](https://github.com/fenrick/MiroDiagramming/commit/f28444bcc3071e20bb7d6c576c7043422d1ace4f))
* **queue:** add concurrency, exponential backoff, max retries, and graceful shutdown\n\n- Configurable workers with in-flight tracking\n- Exponential backoff with jitter and retry cap; drop with error after N attempts\n- Structured logs for processed/retry/dropped events\n- Expose in_flight in /api/limits; stop queue on server close ([f46ae08](https://github.com/fenrick/MiroDiagramming/commit/f46ae08f019b242fc590461ea535c589dd116fe6))
* **queue:** add DLQ and retry metrics ([ffeb0a8](https://github.com/fenrick/MiroDiagramming/commit/ffeb0a83ec043c83e40c119466383fae1117f1fd))
* **queue:** add task success metrics ([8a88d8c](https://github.com/fenrick/MiroDiagramming/commit/8a88d8c82767b524a64394f69009e3530e5ff1f1))
* **queue:** env-based tuning and unify logging with app logger ([ebc6003](https://github.com/fenrick/MiroDiagramming/commit/ebc600389e3508d6348c222bc662b966eecf0b7b))
* **queue:** persist change tasks in sqlite ([c5720db](https://github.com/fenrick/MiroDiagramming/commit/c5720dbad59168626b817470d0b398fa2d0b0dba))
* **queue:** purge permanently failed tasks ([bd62e0b](https://github.com/fenrick/MiroDiagramming/commit/bd62e0b8bae757146ead071ca28bb40b4e6e3fcd))
* **queue:** track completion and retries ([363af28](https://github.com/fenrick/MiroDiagramming/commit/363af2884294dc387a71f4a7d5940519131fdc93))
* replaced tabbar with miro-design-system ([faccc3c](https://github.com/fenrick/MiroDiagramming/commit/faccc3c906e4a84db4d919d1b77b05f34a471336))
* replaced tabbar with miro-design-system ([039606f](https://github.com/fenrick/MiroDiagramming/commit/039606f646974775af073ac08b06b4f2caf7d73b))
* **resize:** add scaling controls ([a46bcb1](https://github.com/fenrick/MiroDiagramming/commit/a46bcb14e20f256ae89b0106bdbb4cbde92b35e3))
* scaffold python backend ([5836008](https://github.com/fenrick/MiroDiagramming/commit/5836008ac4c33b4089a3fabaae839b1e637aaa9f))
* **scripts:** add dev and test helper scripts ([d43aefb](https://github.com/fenrick/MiroDiagramming/commit/d43aefb3935c459b2f9d3a7b13e6e56e9b5f9d6c))
* **server:** add .NET skeleton ([dc4e3aa](https://github.com/fenrick/MiroDiagramming/commit/dc4e3aa4fecc46a0d89e180f1aa96e20da70779a))
* **server:** add async user store API ([b4bc207](https://github.com/fenrick/MiroDiagramming/commit/b4bc2071798fc8392d3fde355b1bfa39eb4e105f))
* **server:** add deletion and validation to user stores ([8569212](https://github.com/fenrick/MiroDiagramming/commit/85692129217ddf0807ad326114ce543a8e3c4061))
* **server:** add logging to excel loader ([76bf518](https://github.com/fenrick/MiroDiagramming/commit/76bf518b59b2a60b6d94f823f8eb6966af78fa74))
* **server:** add named table support ([8ec8509](https://github.com/fenrick/MiroDiagramming/commit/8ec850943f919d1b2a853c64afe6880842c23922))
* **server:** add OAuth authorization code flow ([9f0ddab](https://github.com/fenrick/MiroDiagramming/commit/9f0ddabead5eb08b153615c2aa2f6d49dc3d6b4e))
* **server:** add Postgres integration with EF Core ([14db66c](https://github.com/fenrick/MiroDiagramming/commit/14db66c6d2095f7517372e8f80b97fa9de72d937))
* **server:** add Prisma setup (SQLite), schema for Board/Tag/Shape/User/CacheEntry, and initial migration (create-only) ([835a9e9](https://github.com/fenrick/MiroDiagramming/commit/835a9e959fb7493aee948f3edab6b833c84a554d))
* **server:** add sequential shape queue ([966cb36](https://github.com/fenrick/MiroDiagramming/commit/966cb36823779ae101b230de25d63332656ca0c5))
* **server:** add Serilog logging ([28b1fc8](https://github.com/fenrick/MiroDiagramming/commit/28b1fc8409e52e7937d93d97934d65471a39b0e4))
* **server:** add shape fetch endpoint ([fc7aa83](https://github.com/fenrick/MiroDiagramming/commit/fc7aa83e2cc49a1cb7caf70842b6e21437191005))
* **server:** add style search helper ([eb8f3f4](https://github.com/fenrick/MiroDiagramming/commit/eb8f3f4ce3d76ee19772b37723d2c52876b78511))
* **server:** apply efcore migrations ([3922358](https://github.com/fenrick/MiroDiagramming/commit/3922358c3177f17de93f11e6bcdd7e4a9027ea9d))
* **server:** expose shape data cache API ([c04f32f](https://github.com/fenrick/MiroDiagramming/commit/c04f32f481647513b3ba2aa35777198b56c295f3))
* **server:** expose tag lookup endpoint ([ac3a7df](https://github.com/fenrick/MiroDiagramming/commit/ac3a7dfc9d61e246a8268c32b7ba9050be08a736))
* **server:** harden CORS and cookies ([8da454b](https://github.com/fenrick/MiroDiagramming/commit/8da454bb4b4f04b73237214559cdd6467886e596))
* **server:** implement token refresh ([21a153e](https://github.com/fenrick/MiroDiagramming/commit/21a153e975dd301d1ee583e74c00448dd59cf9c5))
* **server:** persist OAuth tokens with refresh data ([35a6c7d](https://github.com/fenrick/MiroDiagramming/commit/35a6c7d78161ac1b3590be425a8fce374cbc418a))
* **server:** persist templates via ef core ([b3f67f6](https://github.com/fenrick/MiroDiagramming/commit/b3f67f66d9d42c1a97badb0a89c5fb5a9b5924b6))
* **server:** prepare Miro client and token storage scaffolding; docs: clarify single deployable with static serving and root workspace dev ([0177f76](https://github.com/fenrick/MiroDiagramming/commit/0177f7688459a17a5317f9e2ba3cdfd97a7a9bfc))
* **server:** refresh OAuth tokens ([04678bf](https://github.com/fenrick/MiroDiagramming/commit/04678bfb719f65e8544161e9a80efa66251c5c0a))
* **server:** stream rows from Excel ([f905a8f](https://github.com/fenrick/MiroDiagramming/commit/f905a8fa1134335491ca9aaee9e9aa44f467fbe6))
* **shape-store:** add shape model ([b049756](https://github.com/fenrick/MiroDiagramming/commit/b049756b2708f67e81fa619a368a8a21344b3d22))
* **shapes:** add shape schemas and store ([809b57e](https://github.com/fenrick/MiroDiagramming/commit/809b57e94070663fb7608f816568332a1b9fef41))
* **shapes:** batch shape creation via backend ([21ab4ad](https://github.com/fenrick/MiroDiagramming/commit/21ab4ad4456a1e6ffa2667950260e46f4bd2936b))
* solution ([87160d3](https://github.com/fenrick/MiroDiagramming/commit/87160d3fafbb659ac7541902bedbc5f2a17d5235))
* some template stuff ([7077316](https://github.com/fenrick/MiroDiagramming/commit/70773169308f74bfb7389af958cdecbdce4fe29f))
* square aspect ratio ([5264da3](https://github.com/fenrick/MiroDiagramming/commit/5264da3efcff25c4f0c1a30aa066ef8f0641768e))
* **storybook:** add 368px viewport ([e3fcb6c](https://github.com/fenrick/MiroDiagramming/commit/e3fcb6cbc49d394ea66ba7987652c5d6b07e48ec))
* **storybook:** add App page and custom styles ([9e682bb](https://github.com/fenrick/MiroDiagramming/commit/9e682bb304a7ed0298ed2ec43314ae7666b694ab))
* **storybook:** add theme toggle ([73c6cae](https://github.com/fenrick/MiroDiagramming/commit/73c6cae881f4fb96b7c13bf30e4053a0c3247c4a))
* **storybook:** add theme toggle ([a9b2aea](https://github.com/fenrick/MiroDiagramming/commit/a9b2aea750b1fbe3bfaf9bb0cb64fc6cd58204f5))
* **style:** expose opacity and border controls ([61ae725](https://github.com/fenrick/MiroDiagramming/commit/61ae7252a6a3d5352d6d7311f374c4b877cd9fb4))
* **style:** expose opacity and border controls ([efff8e7](https://github.com/fenrick/MiroDiagramming/commit/efff8e7ce26e2aec4611c145205d6fda90905ff1))
* **sync:** add compact progress skeleton and status copy ([54ca395](https://github.com/fenrick/MiroDiagramming/commit/54ca395489a9e45b621006413e34a6164efae49d))
* **sync:** type widget extraction ([b8d488d](https://github.com/fenrick/MiroDiagramming/commit/b8d488da5f8b56ebda3782781a9a047ecff027cf))
* **tags:** add board tag listing endpoint ([2418b53](https://github.com/fenrick/MiroDiagramming/commit/2418b53c21fd86e3bfa8d38a5a3699d47ab85e13))
* **tags:** add tag client create wrapper ([6d53f55](https://github.com/fenrick/MiroDiagramming/commit/6d53f55d7cf706213152baaef38d7df802a26b57))
* **templates:** support aliases and design tokens ([07bc53e](https://github.com/fenrick/MiroDiagramming/commit/07bc53e6900b55ddcc3693cbb5e55bc9a2f61027))
* **templates:** support aliases and design tokens ([aa75b0f](https://github.com/fenrick/MiroDiagramming/commit/aa75b0f580c5769e98c24caa3fcd940d1d08aace))
* **token:** refresh expired access tokens ([a47905d](https://github.com/fenrick/MiroDiagramming/commit/a47905d0b92dcb108c43cbdb98dbeae69339ba49))
* **ui:** add changelog tab ([c3ea618](https://github.com/fenrick/MiroDiagramming/commit/c3ea61827dd299718c4c05f90eb1aac8fe338f45))
* **ui:** add design token shim ([38fc4c5](https://github.com/fenrick/MiroDiagramming/commit/38fc4c52fba1bdf7403be802c88f16d83d8f6e24))
* **ui:** add design-system Select component ([41f3d31](https://github.com/fenrick/MiroDiagramming/commit/41f3d31f8236720ae7f8b87e9fad16025c7e3866))
* **ui:** add design-system Select component ([9901f77](https://github.com/fenrick/MiroDiagramming/commit/9901f7715a36be5d633c1ec506b1c2ed439155a6))
* **ui:** add FormGroup component ([73d15b6](https://github.com/fenrick/MiroDiagramming/commit/73d15b625d6897f099408208d70e103d9323ae10))
* **ui:** add FormGroup component ([13a6d58](https://github.com/fenrick/MiroDiagramming/commit/13a6d5885b0935fe36f6055bdf969454c96f5ca9))
* **ui:** add frame locking option ([c10efe1](https://github.com/fenrick/MiroDiagramming/commit/c10efe120c89a18c5a5c4254aa83fd6fb370ba6b))
* **ui:** add panel and section wrappers ([7c60cf6](https://github.com/fenrick/MiroDiagramming/commit/7c60cf675ee97040b72c9dcd97be588b117f4abd))
* **ui:** add panel and section wrappers ([bc6ba46](https://github.com/fenrick/MiroDiagramming/commit/bc6ba46f8df467db5429f08e15f8b95767627097))
* **ui:** add panel shell wrapper ([8044dd3](https://github.com/fenrick/MiroDiagramming/commit/8044dd3693c35ac28bfa7be5c0c1482b2a30f5b4))
* **ui:** add sticky actions container ([a7a0f14](https://github.com/fenrick/MiroDiagramming/commit/a7a0f1428ad2757f5bcb8d27081b31eacc73469b))
* **ui:** add styled spacing wrappers ([8535fb1](https://github.com/fenrick/MiroDiagramming/commit/8535fb13d40bd684421ebb7d61290c600fd73999))
* **ui:** add styled spacing wrappers ([885c9d8](https://github.com/fenrick/MiroDiagramming/commit/885c9d88f3d90ba4f3f7f16c8266a4a285f37623))
* **ui:** add toast notifications and diff chips ([f1d7489](https://github.com/fenrick/MiroDiagramming/commit/f1d7489b7c168f676fb7cde1af690ae1b15abcfb))
* **ui:** adopt design-system tabs ([55ff76f](https://github.com/fenrick/MiroDiagramming/commit/55ff76f7da595b0fb8ecf4497d2ba8c08f13a15d))
* **ui:** adopt design-system tabs ([6e4987a](https://github.com/fenrick/MiroDiagramming/commit/6e4987ad6dd5ce7b3b1fc222678b8072ef48d03e))
* **ui:** apply sticky layout and status bar styling ([a5a8197](https://github.com/fenrick/MiroDiagramming/commit/a5a8197e5c8b5baabb297336fa699f7231119709))
* **ui:** delay board access with intro screen ([5dde133](https://github.com/fenrick/MiroDiagramming/commit/5dde13391db93df1edbfb4d83a80b69ccb74588f))
* **ui:** delay board access with intro screen ([da2b093](https://github.com/fenrick/MiroDiagramming/commit/da2b093b1115f9fb9cbd4848c5b5dacad54745bc))
* **ui:** expose tab panels with ARIA role ([ad91b2f](https://github.com/fenrick/MiroDiagramming/commit/ad91b2f807d00006842c5659d6e80c1c5d192de7))
* **ui:** improve modal accessibility ([efa3748](https://github.com/fenrick/MiroDiagramming/commit/efa3748d506b2b77c4aeef9951ce8f42e79cbb96))
* **ui:** improve tab navigation accessibility ([da4c520](https://github.com/fenrick/MiroDiagramming/commit/da4c5201a69e30d9de13b4a9c7ff9ffd9c20b495))
* **ui:** integrate board loader into structured tab ([9316a46](https://github.com/fenrick/MiroDiagramming/commit/9316a46b34a8fef5d308807170fca96212ae2ebd))
* **ui:** introduce tools tab with subtabs ([cab6f47](https://github.com/fenrick/MiroDiagramming/commit/cab6f4776d126b9c0cf23038d0731eaaa411606e))
* **ui:** map buttons and inputs to design system ([3e51085](https://github.com/fenrick/MiroDiagramming/commit/3e510851a0b4f246165722e001e1d87121301699))
* **ui:** map buttons and inputs to design system ([e8df133](https://github.com/fenrick/MiroDiagramming/commit/e8df1338b99ccada12a19b7b6e3a14edbeafc3aa))
* **ui:** merge arrange tools and changelog ([7d284ae](https://github.com/fenrick/MiroDiagramming/commit/7d284ae278e1a42ee73cb7ff971f7c1f67a67038))
* **ui:** overlay tooltips and storybook ([6998369](https://github.com/fenrick/MiroDiagramming/commit/69983696317f6bf13e8057f7ceb49c814948e6da))
* **ui:** overlay tooltips and storybook ([a767d45](https://github.com/fenrick/MiroDiagramming/commit/a767d4500603c378ad02a0bb467bce273c5d6144))
* **ui:** provide panel scroll area ([1990014](https://github.com/fenrick/MiroDiagramming/commit/19900141a6567ec477a481b1ffac75cddb7b5da0))
* **ui:** rename create tab to diagrams ([ca8b7f1](https://github.com/fenrick/MiroDiagramming/commit/ca8b7f15695fa99a1a1a2891a7196cb1fb7283cb))
* **ui:** render app with miro provider ([0643199](https://github.com/fenrick/MiroDiagramming/commit/064319901e9fe8fd9996971e37f207292be796dd))
* **ui:** render intro and changelog from markdown ([c285e05](https://github.com/fenrick/MiroDiagramming/commit/c285e053246a02c7cb65af6084f119aa541c0b17))
* **ui:** render intro and changelog from markdown ([8bc11ff](https://github.com/fenrick/MiroDiagramming/commit/8bc11ffac8b1fc1d29468675897cde0ab4c3a2e1))
* **ui:** simplify InputField API ([d91fde6](https://github.com/fenrick/MiroDiagramming/commit/d91fde67722ce818b7c6f4390aebc75e9a6461de))
* **ui:** simplify InputField API ([136acb2](https://github.com/fenrick/MiroDiagramming/commit/136acb2a02f6473aafa8f74621d356ebe14b16d8))
* **ui:** standardize drawer sizing and labels ([8b9749a](https://github.com/fenrick/MiroDiagramming/commit/8b9749a6fb24f876da5a7158a4888176a2b75139))
* **ui:** support button icons ([c2011ee](https://github.com/fenrick/MiroDiagramming/commit/c2011eee62109c3fca4300fb3dce244aabe6a1ae))
* **ui:** support button icons ([b239122](https://github.com/fenrick/MiroDiagramming/commit/b239122dedfe5221fe2676390cdc909e4911c7e6))
* **ui:** sync tokens with design library ([88a1551](https://github.com/fenrick/MiroDiagramming/commit/88a155129aa4d9a675f39c6f13dc718d80713630))
* **ui:** sync tokens with design library ([df049aa](https://github.com/fenrick/MiroDiagramming/commit/df049aacbc2b8fb8c42bfc35f595eb652369d8b4))
* **ui:** unify tab panels and document stories ([beeca5f](https://github.com/fenrick/MiroDiagramming/commit/beeca5f760d8359e88eaae10c82569263d75ba07))
* **ui:** unify tab panels and document stories ([b63edb4](https://github.com/fenrick/MiroDiagramming/commit/b63edb4c9e2c1069cd2a058fc6753934a5e46d8f))
* **ui:** update InputField API ([d889853](https://github.com/fenrick/MiroDiagramming/commit/d889853ca0de810c5c8f6a65691d0e879583a87a))
* **ui:** update InputField API ([6992fa8](https://github.com/fenrick/MiroDiagramming/commit/6992fa84e2ff9fa52a955d7d3ad9700377a887e4))
* **ui:** use design system slider ([843176d](https://github.com/fenrick/MiroDiagramming/commit/843176d554283dbfb82f885edb7e1ef9bcd5b05f))
* **users:** add user creation endpoint ([a1e45e6](https://github.com/fenrick/MiroDiagramming/commit/a1e45e6575f84bc9b884d3b7d944aa54f39fee0a))
* **utils:** add color mixing function ([801a321](https://github.com/fenrick/MiroDiagramming/commit/801a321c9f4936d091aa520ec7efe3301ee498f7))
* **web:** add auth banner and session repair ([1819abb](https://github.com/fenrick/MiroDiagramming/commit/1819abb04efd425c252f70d7bda10757424fa80a))
* **web:** add microcopy and error messages ([7e36f6d](https://github.com/fenrick/MiroDiagramming/commit/7e36f6d04bed2eae3748a93ae432a12e256ce92b))
* **webhook,docs:** verify webhook signature over raw body; add Prisma scripts and docs\n\n- Register fastify-raw-body and enable for /api/webhook (safe fallback to JSON)\n- Add migrate:dev and migrate:deploy scripts; ignore *.db\n- Add Prisma Client import and Pulse tip to README and node architecture docs ([6d94ff5](https://github.com/fenrick/MiroDiagramming/commit/6d94ff5705fb3aa2689f0f58dfff82f177168843))


### Performance Improvements

* .editorconfig ([dd441bd](https://github.com/fenrick/MiroDiagramming/commit/dd441bd113dec566774fbfb6ca89cd9282730058))
* aspect-ratio.ts ([9cd12eb](https://github.com/fenrick/MiroDiagramming/commit/9cd12eb67513c423426595b63a4b2ae70bd9963f))
* ci.yml ([604d055](https://github.com/fenrick/MiroDiagramming/commit/604d055d7a03076369b95c6f77bae43cc0635bd2))
* code cleanup ([466c51b](https://github.com/fenrick/MiroDiagramming/commit/466c51ba68561bd4dfd875db094fe025282d5743))
* code cleanup ([2219359](https://github.com/fenrick/MiroDiagramming/commit/2219359103420b8df12938dd3332532ab39ccb93))
* missed this ([cc261de](https://github.com/fenrick/MiroDiagramming/commit/cc261deea131319d69d3151bd4429bcf36b05674))
* prettier ([39a5d7d](https://github.com/fenrick/MiroDiagramming/commit/39a5d7d8fdbe81594754723019ce2e406c8a272b))
* prettier ([885d92e](https://github.com/fenrick/MiroDiagramming/commit/885d92e66cdfc008e66670954aa5395d0133865e))
* remove dead tests due to gui changes ([da335be](https://github.com/fenrick/MiroDiagramming/commit/da335be1d1256c427bdb1bd47628619e5b2025bd))
* remove dead tests due to gui changes ([d2d8daf](https://github.com/fenrick/MiroDiagramming/commit/d2d8dafe60a1bacd3810d8df979d40d34b5d3f8e))
* remove redundant ([9f8f014](https://github.com/fenrick/MiroDiagramming/commit/9f8f0148998a25e830ff658cff9d9d297ac7e315))
* remove redundant ([869af21](https://github.com/fenrick/MiroDiagramming/commit/869af21abd2b6a28ae34503fec999481a39befd9))
* update TabGrid.tsx ([91e44d4](https://github.com/fenrick/MiroDiagramming/commit/91e44d411447706677931b5b7b9498b5b179ebbe))
* update TabGrid.tsx ([3a9e04d](https://github.com/fenrick/MiroDiagramming/commit/3a9e04ddf8e3b7629694a49b0b9a8b0f4cf797e5))
* working on input field ([89e3248](https://github.com/fenrick/MiroDiagramming/commit/89e324871709854d727417040cc5da1cfe2f0024))
* working on input field ([a56a4be](https://github.com/fenrick/MiroDiagramming/commit/a56a4be1ea4aa03293d6acd11d7558166fd92a6c))

## unreleased

### Bug Fixes

- enable soft token-bucket limiter for production queue

## [1.18.1](https://github.com/fenrick/MiroDiagramming/compare/v1.18.0...v1.18.1) (2025-07-19)

### Performance Improvements

- update .editorconfig ([2c29034](https://github.com/fenrick/MiroDiagramming/commit/2c290340e336f6295e7f6743f242ebd152313b08))

# [1.18.0](https://github.com/fenrick/MiroDiagramming/compare/v1.17.0...v1.18.0) (2025-07-02)

### Features

- **ui:** rename create tab to diagrams ([98d607f](https://github.com/fenrick/MiroDiagramming/commit/98d607faf54ba8a1a89696632310927d87a2fddd))

# [1.17.0](https://github.com/fenrick/MiroDiagramming/compare/v1.16.1...v1.17.0) (2025-07-02)

### Bug Fixes

- form layout ([d085888](https://github.com/fenrick/MiroDiagramming/commit/d0858887c9936a773b76de7459321f7643764df3))
- husky install deprecated ([0d1cb5e](https://github.com/fenrick/MiroDiagramming/commit/0d1cb5e3496c7e41bca59237d222c5c4c0d4f281))
- layout corrections ([9c8ffcd](https://github.com/fenrick/MiroDiagramming/commit/9c8ffcd0b1daee0a6fe880bf855eb07d63310e73))
- **layout:** skip spacer nodes in results ([c9307ac](https://github.com/fenrick/MiroDiagramming/commit/c9307ace285707f5b4d925e8af927fa05faa7dff))
- move to component ([f8c91fd](https://github.com/fenrick/MiroDiagramming/commit/f8c91fd92022dabd047265de1a9217a0007bc116))
- rename tab ([4599771](https://github.com/fenrick/MiroDiagramming/commit/459977170324e86fa9626286bb3ef4673908ec53))
- update package.json ([5d15ce1](https://github.com/fenrick/MiroDiagramming/commit/5d15ce1b7f84a2ab9b9273628eda8ccb72036055))

### Features

- **build:** add local CI script ([1ad4bd5](https://github.com/fenrick/MiroDiagramming/commit/1ad4bd53e2bf17fc41c7205038c9b46e075cc64e))
- **layout:** add recursive ELK preprocessor ([0d8c087](https://github.com/fenrick/MiroDiagramming/commit/0d8c0878d1ff74700937ab98629497e793d3e3e9))
- **layout:** integrate elk preprocessor and options ([bbacd8c](https://github.com/fenrick/MiroDiagramming/commit/bbacd8c5c3c948b33bc4f8c9fdf2e16fa3edaf34))
- square aspect ratio ([9dc3e78](https://github.com/fenrick/MiroDiagramming/commit/9dc3e78a1114abf8bfe6c1c097e4c9f0e26f5ae9))

### Performance Improvements

- aspect-ratio.ts ([6cab979](https://github.com/fenrick/MiroDiagramming/commit/6cab9798890ed01f16dcad2be27cb3feee557dc4))
- missed this ([a81ccd3](https://github.com/fenrick/MiroDiagramming/commit/a81ccd361a0e6a7f936fab00dd768a7ae1f2e9d4))
- prettier ([bf2e29c](https://github.com/fenrick/MiroDiagramming/commit/bf2e29c7f0d7cc88beaa304ca6eec56711f64e96))
- prettier ([52248cc](https://github.com/fenrick/MiroDiagramming/commit/52248cca7d92fc42b56c4f7864f111c790801f91))

## [1.16.1](https://github.com/fenrick/MiroDiagramming/compare/v1.16.0...v1.16.1) (2025-07-01)

### Performance Improvements

- ci.yml ([ccb7989](https://github.com/fenrick/MiroDiagramming/commit/ccb79893027332673a866ba17debd248867e1c66))
- update TabGrid.tsx ([a5bb3c1](https://github.com/fenrick/MiroDiagramming/commit/a5bb3c184cee3a73ec17bd62157740e97f00c361))
- update TabGrid.tsx ([c3f2c25](https://github.com/fenrick/MiroDiagramming/commit/c3f2c2578e5b810fedd97818439605047ae67d2b))

# [1.16.0](https://github.com/fenrick/MiroDiagramming/compare/v1.15.2...v1.16.0) (2025-07-01)

### Features

- **ui:** expose tab panels with ARIA role ([a90df9f](https://github.com/fenrick/MiroDiagramming/commit/a90df9f871861388e597b866f2961b0ec093fd78))

## [1.15.2](https://github.com/fenrick/MiroDiagramming/compare/v1.15.1...v1.15.2) (2025-07-01)

### Bug Fixes

- **tests:** remove orig variable and avoid state mocking ([677b809](https://github.com/fenrick/MiroDiagramming/commit/677b8095cdcf8bc362b3b497881fb28e29fc5e6a))

## [1.15.1](https://github.com/fenrick/MiroDiagramming/compare/v1.15.0...v1.15.1) (2025-07-01)

### Bug Fixes

- **ui:** remove redundant dialog role ([5368a22](https://github.com/fenrick/MiroDiagramming/commit/5368a22eeab503e18f39932a03f7295fee8866a9))

# [1.15.0](https://github.com/fenrick/MiroDiagramming/compare/v1.14.0...v1.15.0) (2025-07-01)

### Features

- **ui:** unify tab bar component ([2644b61](https://github.com/fenrick/MiroDiagramming/commit/2644b6111013ecee4dc7daef83086e479c07a833))

# [1.14.0](https://github.com/fenrick/MiroDiagramming/compare/v1.13.0...v1.14.0) (2025-07-01)

### Features

- **ui:** improve tab navigation accessibility ([cf3ef09](https://github.com/fenrick/MiroDiagramming/commit/cf3ef09eda00babc7aec776e1362f87fd8688ca1))
- **ui:** introduce tools tab with subtabs ([554a4e6](https://github.com/fenrick/MiroDiagramming/commit/554a4e6be579e62b7c07cd68e0e24a2b016bdd0d))
- **utils:** add color mixing function ([3aa2adc](https://github.com/fenrick/MiroDiagramming/commit/3aa2adc3466cfe7104309966b3a0edcc5c676c8a))

# [1.13.0](https://github.com/fenrick/MiroDiagramming/compare/v1.12.1...v1.13.0) (2025-07-01)

### Bug Fixes

- **style:** add missing semicolons ([e1ad64b](https://github.com/fenrick/MiroDiagramming/commit/e1ad64b78703a6b5eabd8a07f2cfa0f3acf91711))
- **ui:** remove metadata casts in row hook ([e41686e](https://github.com/fenrick/MiroDiagramming/commit/e41686e66e1a712e3cc7f85edc318dcda8b3c17f))

### Features

- **sync:** type widget extraction ([d567e11](https://github.com/fenrick/MiroDiagramming/commit/d567e11ffac6fca3c80c5b7485537ea21493a087))
- **ui:** improve modal accessibility ([1fe800a](https://github.com/fenrick/MiroDiagramming/commit/1fe800aeb91a1b3e494fcadb874f7b8f6efb3f3d))

## [1.12.1](https://github.com/fenrick/MiroDiagramming/compare/v1.12.0...v1.12.1) (2025-07-01)

### Bug Fixes

- style issues ([f69acd6](https://github.com/fenrick/MiroDiagramming/commit/f69acd66cecd9f8d5ddc7a4dbf91f6848c4c0291))
- **style:** add button type to StyleTab ([e078c17](https://github.com/fenrick/MiroDiagramming/commit/e078c17b417749ad32d5f99b2a592df0c71de042))
- **tabs:** adjust selectors and tests ([4298f65](https://github.com/fenrick/MiroDiagramming/commit/4298f656d518ca7a166a261a7e7f0e1c94f1d2e7))

# [1.12.0](https://github.com/fenrick/MiroDiagramming/compare/v1.11.2...v1.12.0) (2025-07-01)

### Features

- **core:** load exceljs from cdn ([6ebfff8](https://github.com/fenrick/MiroDiagramming/commit/6ebfff8a39ff19f9761f78abe66c8a4e17f19080))

## [1.11.2](https://github.com/fenrick/MiroDiagramming/compare/v1.11.1...v1.11.2) (2025-07-01)

### Bug Fixes

- prettier to ignore CHANGELOG.md ([f8aecd2](https://github.com/fenrick/MiroDiagramming/commit/f8aecd2b95f2f4effca80568a9aa4ee9fd427fb0))

## [1.11.1](https://github.com/fenrick/MiroDiagramming/compare/v1.11.0...v1.11.1) (2025-06-30)

### Bug Fixes

- **core:** improve excel loader and UI ([758294e](https://github.com/fenrick/MiroDiagramming/commit/758294e9b7ada1479e24b5a2b3b9cf2c91c11b29))

# [1.11.0](https://github.com/fenrick/MiroDiagramming/compare/v1.10.0...v1.11.0) (2025-06-30)

### Bug Fixes

- **app:** prefix custom event
  ([e995a1c](https://github.com/fenrick/MiroDiagramming/commit/e995a1c2041caf47cfeaa87d1f86273f6accde06))
- **core:** replace xlsx with exceljs
  ([68e81c5](https://github.com/fenrick/MiroDiagramming/commit/68e81c57bf20e9e47aba539cf303a1252a89c112))

### Features

- **resize:** add scaling controls
  ([6a639d1](https://github.com/fenrick/MiroDiagramming/commit/6a639d1644bdd3cb2aa239bb586268d628f291d8))
- **ui:** add frame locking option
  ([b173648](https://github.com/fenrick/MiroDiagramming/commit/b17364825236314b31a08de91a5a7ce2e1309273))

# [1.10.0](https://github.com/fenrick/MiroDiagramming/compare/v1.9.0...v1.10.0) (2025-06-30)

### Bug Fixes

- add button role
  ([eab2023](https://github.com/fenrick/MiroDiagramming/commit/eab2023d2f229b7889fc03088aa711e4c3357bd0))
- **auth:** use secure random generator
  ([5f3e0f6](https://github.com/fenrick/MiroDiagramming/commit/5f3e0f65d18971a870bcb3def2db23343beeb710))
- **board:** remove redundant type assertion
  ([94ec991](https://github.com/fenrick/MiroDiagramming/commit/94ec99173da8bf5d088db6e66a196a90c7667bdf))
- **core:** apply code quality improvements
  ([0692c78](https://github.com/fenrick/MiroDiagramming/commit/0692c78d7fceb7a89a1d51a6e29cb879a8bb4de0))
- **core:** improve utils and accessibility
  ([c3ee8d3](https://github.com/fenrick/MiroDiagramming/commit/c3ee8d36134e240636dc22a499701c9f24c44f62))
- improve fill color fallback logic in style presets
  ([d1a8812](https://github.com/fenrick/MiroDiagramming/commit/d1a8812d01cdd794301727c09e441163332396dd))
- make computePosition public and update tests
  ([a77e0b6](https://github.com/fenrick/MiroDiagramming/commit/a77e0b67f2dd550c043ddf7fed0940b1b8ad7dc0))
- **modal:** add keyboard handler to backdrop
  ([40d8b32](https://github.com/fenrick/MiroDiagramming/commit/40d8b325b3969434ba02e2992e88133652042884))
- **modal:** improve accessibility and drop handling
  ([0bd05ef](https://github.com/fenrick/MiroDiagramming/commit/0bd05ef7252a9e3b234731b9d656a4af9f6af701))
- **modal:** update tests to query accessible elements
  ([b5de56f](https://github.com/fenrick/MiroDiagramming/commit/b5de56f707a86f3d29f2fa87795c209368ba14c1))
- refactor node dimension resolution logic
  ([829c904](https://github.com/fenrick/MiroDiagramming/commit/829c904387c6546a4273181514fd49e0b2844a26))
- refactor useDebouncedSearch destructuring in SearchTab
  ([00a47a8](https://github.com/fenrick/MiroDiagramming/commit/00a47a832d4d36c79e94ef674d03ac6c3592efe1))
- remove unnecessary eslint-disable-next-line complexity comments
  ([a7d6055](https://github.com/fenrick/MiroDiagramming/commit/a7d6055263fe7d8758f7a1a1d196e8050a43f2c8))
- simplify fill color extraction in templateToPreset
  ([172d5a7](https://github.com/fenrick/MiroDiagramming/commit/172d5a7739f1c8acc786301760906643bb35385a))
- **tests:** wrap width change in act
  ([84169c0](https://github.com/fenrick/MiroDiagramming/commit/84169c0ad1b6c399b6e56ce59959488ad8bfad33))
- **ui:** remove dead modal handlers
  ([fcb6ecd](https://github.com/fenrick/MiroDiagramming/commit/fcb6ecd7bc8f561c908c5ce5529d22e0ffdcd46a))
- **ui:** resolve template colors in style presets
  ([56ce20e](https://github.com/fenrick/MiroDiagramming/commit/56ce20eca2bb6d585c5679a39e2b0132fca4659e))
- **utils:** avoid regex backtracking in base64 encoding
  ([1883328](https://github.com/fenrick/MiroDiagramming/commit/188332885d5f7a0e91f9b7389c4f1a07d84961ce))
- valueOrDefault to use nullish coalescing
  ([0506b76](https://github.com/fenrick/MiroDiagramming/commit/0506b76d5776ca84e00a064925bd0e81c05d6671))

### Features

- **board:** extract shape style builder
  ([f0a2f40](https://github.com/fenrick/MiroDiagramming/commit/f0a2f408ffcc6d35a66573b9e93b8bbb74099820))
- **board:** refactor token resolution helpers
  ([ea08b12](https://github.com/fenrick/MiroDiagramming/commit/ea08b127d9687bf1fc87e2f63c62f14d23133e41))
- **core:** refactor data mapper helpers
  ([4bedd49](https://github.com/fenrick/MiroDiagramming/commit/4bedd49634630b58bbacd44818c174c935b5bbb1))
- **core:** refactor excel sync service
  ([d1e52cf](https://github.com/fenrick/MiroDiagramming/commit/d1e52cf5a1b8db3919b51efc6ac29c1ec2561a46))
- **graph:** support hierarchical file import
  ([b194ffb](https://github.com/fenrick/MiroDiagramming/commit/b194ffb0bd79c38aebecae017857991e2ccf0c58))
- **layout:** extract dimension helper
  ([ea677f6](https://github.com/fenrick/MiroDiagramming/commit/ea677f6d666ed1581fecbcf89a48553825739429))
- **ui:** add changelog tab
  ([60d4d7f](https://github.com/fenrick/MiroDiagramming/commit/60d4d7f0fe504f5d35ca745b2a03ceeebfdc309b))
- **ui:** merge arrange tools and changelog
  ([50a3d34](https://github.com/fenrick/MiroDiagramming/commit/50a3d348f003cc4fb6a579b4fa861d5cff1b9f62))
