# [1.10.0](https://github.com/fenrick/MiroDiagramming/compare/v1.9.0...v1.10.0) (2025-06-30)


### Bug Fixes

* add button role ([eab2023](https://github.com/fenrick/MiroDiagramming/commit/eab2023d2f229b7889fc03088aa711e4c3357bd0))
* **auth:** use secure random generator ([5f3e0f6](https://github.com/fenrick/MiroDiagramming/commit/5f3e0f65d18971a870bcb3def2db23343beeb710))
* **board:** remove redundant type assertion ([94ec991](https://github.com/fenrick/MiroDiagramming/commit/94ec99173da8bf5d088db6e66a196a90c7667bdf))
* **core:** apply code quality improvements ([0692c78](https://github.com/fenrick/MiroDiagramming/commit/0692c78d7fceb7a89a1d51a6e29cb879a8bb4de0))
* **core:** improve utils and accessibility ([c3ee8d3](https://github.com/fenrick/MiroDiagramming/commit/c3ee8d36134e240636dc22a499701c9f24c44f62))
* improve fill color fallback logic in style presets ([d1a8812](https://github.com/fenrick/MiroDiagramming/commit/d1a8812d01cdd794301727c09e441163332396dd))
* make computePosition public and update tests ([a77e0b6](https://github.com/fenrick/MiroDiagramming/commit/a77e0b67f2dd550c043ddf7fed0940b1b8ad7dc0))
* **modal:** add keyboard handler to backdrop ([40d8b32](https://github.com/fenrick/MiroDiagramming/commit/40d8b325b3969434ba02e2992e88133652042884))
* **modal:** improve accessibility and drop handling ([0bd05ef](https://github.com/fenrick/MiroDiagramming/commit/0bd05ef7252a9e3b234731b9d656a4af9f6af701))
* **modal:** update tests to query accessible elements ([b5de56f](https://github.com/fenrick/MiroDiagramming/commit/b5de56f707a86f3d29f2fa87795c209368ba14c1))
* refactor node dimension resolution logic ([829c904](https://github.com/fenrick/MiroDiagramming/commit/829c904387c6546a4273181514fd49e0b2844a26))
* refactor useDebouncedSearch destructuring in SearchTab ([00a47a8](https://github.com/fenrick/MiroDiagramming/commit/00a47a832d4d36c79e94ef674d03ac6c3592efe1))
* remove unnecessary eslint-disable-next-line complexity comments ([a7d6055](https://github.com/fenrick/MiroDiagramming/commit/a7d6055263fe7d8758f7a1a1d196e8050a43f2c8))
* simplify fill color extraction in templateToPreset ([172d5a7](https://github.com/fenrick/MiroDiagramming/commit/172d5a7739f1c8acc786301760906643bb35385a))
* **tests:** wrap width change in act ([84169c0](https://github.com/fenrick/MiroDiagramming/commit/84169c0ad1b6c399b6e56ce59959488ad8bfad33))
* **ui:** remove dead modal handlers ([fcb6ecd](https://github.com/fenrick/MiroDiagramming/commit/fcb6ecd7bc8f561c908c5ce5529d22e0ffdcd46a))
* **ui:** resolve template colors in style presets ([56ce20e](https://github.com/fenrick/MiroDiagramming/commit/56ce20eca2bb6d585c5679a39e2b0132fca4659e))
* **utils:** avoid regex backtracking in base64 encoding ([1883328](https://github.com/fenrick/MiroDiagramming/commit/188332885d5f7a0e91f9b7389c4f1a07d84961ce))
* valueOrDefault to use nullish coalescing ([0506b76](https://github.com/fenrick/MiroDiagramming/commit/0506b76d5776ca84e00a064925bd0e81c05d6671))


### Features

* **board:** extract shape style builder ([f0a2f40](https://github.com/fenrick/MiroDiagramming/commit/f0a2f408ffcc6d35a66573b9e93b8bbb74099820))
* **board:** refactor token resolution helpers ([ea08b12](https://github.com/fenrick/MiroDiagramming/commit/ea08b127d9687bf1fc87e2f63c62f14d23133e41))
* **core:** refactor data mapper helpers ([4bedd49](https://github.com/fenrick/MiroDiagramming/commit/4bedd49634630b58bbacd44818c174c935b5bbb1))
* **core:** refactor excel sync service ([d1e52cf](https://github.com/fenrick/MiroDiagramming/commit/d1e52cf5a1b8db3919b51efc6ac29c1ec2561a46))
* **graph:** support hierarchical file import ([b194ffb](https://github.com/fenrick/MiroDiagramming/commit/b194ffb0bd79c38aebecae017857991e2ccf0c58))
* **layout:** extract dimension helper ([ea677f6](https://github.com/fenrick/MiroDiagramming/commit/ea677f6d666ed1581fecbcf89a48553825739429))
* **ui:** add changelog tab ([60d4d7f](https://github.com/fenrick/MiroDiagramming/commit/60d4d7f0fe504f5d35ca745b2a03ceeebfdc309b))
* **ui:** merge arrange tools and changelog ([50a3d34](https://github.com/fenrick/MiroDiagramming/commit/50a3d348f003cc4fb6a579b4fa861d5cff1b9f62))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

- Initial creation of changelog.
- Automatically convert hierarchical and flat graph files when imported.
- Refactor tab pages to use dedicated hooks for diagram, Excel and search logic.
