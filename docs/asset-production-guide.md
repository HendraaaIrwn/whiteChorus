# White Chorus Asset Production Guide

Production assets must be supplied by the official art owner. Character layers use identical transparent canvases, origins, and anchors. Keep released filenames immutable; add a version suffix when artwork changes.

- Characters: `character-a` (Emir), `character-b` (Friska).
- Categories: Hair, Top, Bottom, One Piece, Shoes, Accessories; five active items each at launch, maximum ten without a PRD change.
- Backgrounds: five total at launch.
- Render target: 1200×1600. Background thumbnail: 4:3. Item thumbnails must show the complete item.
- Base layers: `public/dress-up/character-a/base.webp` and `public/dress-up/character-b/base.webp`, both transparent 1200×1600 canvases.
- Watermark: `public/brand/watermark-white.png` on a transparent 1200×1600 canvas so the renderer can apply it deterministically.
- Naming: lowercase kebab-case; catalog IDs are stable and unique.
- Hair may have back/front render paths. One Piece must align without Top/Bottom.
- Run `pnpm assets:validate:release` before production deployment.
- Set `NEXT_PUBLIC_ASSET_MODE=production` in preview/production only after that release validation passes.

The release validator also requires the official MP3, horizontal logo, and watermark. Fixture mode is never a production acceptance substitute.
