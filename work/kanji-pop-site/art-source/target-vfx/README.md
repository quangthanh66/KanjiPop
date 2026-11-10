# Elemental target VFX — approved hybrid

The owner approved study 05 (sprite + refractive core + thin fluid energy) for all target gems on 2026-11-08. Production implementation: `dist/target-vfx.js`.

Six new transparent 4×4 atlases were generated with the built-in OpenAI imagegen tool. Original PNGs are kept here; exact generation prompts and source paths are in `provenance.json`. Runtime copies are 1024×1024 alpha WebP files in `dist/target-vfx-assets/`.

Magic reuses the previously approved `art-source/vfx-study/magic-ribbon-atlas.png`, with its original prompt in `art-source/vfx-study/provenance.json` and runtime asset in `dist/vfx-study-assets/`. It is recolored per gem at runtime alongside the six grayscale materials.

All seven elements retain the same three layers. Material atlases, circulation speed, fluid turbulence and small carried particles vary by element; palette color comes from the tile's actual `--tile-mid`. Layers follow the rounded facet contour. The glyph remains above the effect.

Production loads atlases lazily, caches contour maps, caps tinted frame sets at four and renders only the current target. Full/light quality uses 30/24 fps; reduced motion displays a static hybrid. Hidden pages, closed play views and open modal overlays stop animation. If an atlas fails to load, the core and thin energy remain visible.

Provenance records generation and processing, not legal clearance for release. Local-only development remains in effect.
