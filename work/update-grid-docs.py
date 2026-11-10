from pathlib import Path
p=Path('work/kanji-pop-site/GAMEPLAY.md');s=p.read_text(encoding='utf-8')
s=s.replace('`pairs.css`, and `n5.css`','`pairs.css`, `n5.css`, and `responsive.css`')
s=s.replace('- A playable board has exactly one blank, either 8 tiles (3×3) or 14 tiles (3×5).','''- Dimensions are columns × rows. A new run grows with its introduced recipe pool:
  - Level 1: 3×3, 8 tiles and 1 blank.
  - Level 2: 4×3, 10 tiles and 2 blanks.
  - Levels 3–5: 4×4, 14 tiles and 2 blanks.
  - Mobile levels 6–15: 4×5, 18 tiles and 2 blanks.
  - Desktop levels 6–7: 5×4, 18 tiles and 2 blanks; levels 8–15: 5×6, 28 tiles and 2 blanks.
- Desktop is a viewport at least 900 px wide. The shape is fixed at run creation; resizing or reloading never changes a current board. Start/restart chooses the current viewport. Growth prevents duplicate target recipes merely to fill space. Fourteen colors have distinct corner marks as a secondary identifier.''')
s=s.replace('- A tap slides an orthogonal neighbor into the blank; swipes and keyboard arrows are also supported. No swapping with occupied cells.','- A tap slides a tile when it has exactly one adjacent blank. With two choices, tapping selects the tile and highlights both blank destinations; the player taps a destination or swipes in its direction. Keyboard selection plus arrows and keyboard activation of blank buttons are supported. No diagonal movement or swapping with occupied cells.')
s=s.replace('There are temporarily three blanks.','There are temporarily two extra blanks.')
s=s.replace('the board returns to one blank.','the board returns to its original blank count.')
s=s.replace('- A bounded breadth-first hint searches for a required match, falling back to a reachable review match to open space. It highlights one legal move; it never changes the board itself.','- A bounded breadth-first hint searches for a required match. If its full-board search budget is exhausted, an abstract target-pair/blank search takes priority over a review match. Both the tile and destination are highlighted; hints never change the board.')
s=s.replace('engine schema v7.','engine schema v8. Saved v7 runs and undo history migrate to a legacy 3-column layout, preserving their current board and pending refill exactly. A new run uses the new dimensions.')
a=s.index('From the chat workspace:');b=s.index('Browser checks require',a)
s=s[:a]+'''From the chat workspace:

- `node work/grid-engine-check.cjs`: solves all 15 levels in both modes, verifies all 24 targets, exercises more than 9,000 transitions, checks complementary unique pairs, safe refills, explicit blank choices, and legacy migration. Results: `work/grid-check-results.json`.
- `node work/grid-browser-check.cjs`: checks 5×6 / 4×5 at 320–1440 px, tile targets, no overlaps or horizontal overflow, resize stability, viewport-dependent restarts, explicit blank selection, keyboard, hints, undo, and old pending-reveal/history migration. Results: `work/grid-browser-results.json`.
- `node work/grid-touch-check.cjs`: checks mobile touchscreen selection, destination taps and swipes, plus a complete desktop level with reveal/refill and saved-run reload.
- Earlier `n5-*check.cjs` and `responsive-check.cjs` files describe prior layouts and are retained as historical checks; their one-blank/count assumptions are no longer current.

''' +s[b:]
s=s.replace('`work/responsive-check.cjs` verifies map/play/album at 320–1440 px, full-width desktop, no horizontal overflow, tile placement after resizing, mouse matching, undo, hint and modal behavior. State transitions and curriculum are unchanged.','The desktop play stage expands up to 720 px. Tile hit targets stay at least 44×44 px even when a desktop run is resized to a phone viewport. Very short phones may scroll rather than shrink the tiles. The curriculum, album and unlock sequence are unchanged.')
p.write_text(s,encoding='utf-8')
