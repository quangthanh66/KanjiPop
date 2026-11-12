# Kanjidle: local N5 roadmap prototype

## P0 local safeguards (2026-11-07)

`progress-store.js` validates saves/imports, rotates the previous valid primary into
`kanji-pop-n5-v1-backup`, and preserves an unreadable primary under the `-damaged`
key before continuing. Storage failure is visible, rather than swallowed. A changed
primary from another tab blocks subsequent writes until reload. Additionally,
`progress-lock.js` holds an exclusive Web Lock for each save namespace. A second tab
or a browser without the API stays read-only and can export its session. Close the
writer and reload to take over. Old app tabs not using Web Locks must be refreshed.
This does not provide cloud sync or payment entitlements.

Settings now includes **Sao lưu & khôi phục tiến trình**. JSON export includes the
board, album, results, undo history and sound preference, but not experience settings,
encounter counts or playtest logs. Imports are size-limited, engine-validated and
previewed before explicit confirmation. Blocked storage still allows manual export.
Both automatic copies can be lost when browser data is cleared; keep a downloaded
copy for independent recovery. Imported data is not a payment entitlement.

`P0-PLAN.txt` tracks completed technical work and outstanding human/rights checks.
`content-review.json` contains 24 review records, all awaiting expert sign-off.
`asset-inventory.json` records local assets and external font dependencies; it is not
commercial rights clearance. `p0-audit-results.json` separates PC/mobile route and
random-play diagnostics. Timing there is Node execution on this machine, not mobile
browser performance. Initial authored boards are unchanged; the distance-five
invariant is checked for replacement pairs. No tests establish human engagement.

Additional checks from the chat workspace:
`node work/progress-store-check.cjs`, `node work/progress-browser-check.cjs`,
`node work/p0-audit.cjs`. Regenerate review inventories with
`node work/make-p0-review.cjs`; expert review is retained only for unchanged records.

## Specialist review and isolated studies

The owner selected Vietnamese adult beginners/nonlearners, self-authored educational
prose with licensed external inputs only, and original gem treatment A after comparing
three samples. Decisions are recorded in `review-decisions.json`.
The cosmic-crystal A material is now applied in `gem-art.js`/`gem-art.css` across
the board, result gem and formula. Existing pair palette/cut mapping is preserved.

Settings → **Mở phiên chơi thử riêng** creates a random `?playtest=<id>` URL and a
separate save/experience namespace. The study setup requests familiarity and local
recording consent, no name/email. Export JSON includes a per-run summary: new start
versus resume, first-match visible time, invalid actions, hints and refill disturbance.
It does not infer abandonment, retention or recall. No external analytics service is
used. Unknown timing is null; truncated logs report the dropped count. Existing logs
without run IDs are retained but excluded from per-run totals. Participant ratings
start blank. The main save and album remain separate from each study.

AI review checked all 24 characters against named sources and authored new Vietnamese
notes. 本/白 are labeled visual mnemonics, not verified etymologies. Readings are
explicitly labeled as belonging to the whole example word. See `kanji-source-review.json`
and `content-provenance.json`; no human expert or commercial-rights signoff is implied.
Fonts now load locally through `fonts.css`, with pinned binaries/OFL notices documented
in `font-provenance.json`. Tools for font maintenance live outside `dist`.

## Active implementation

`dist/index.html` loads `n5-data.js`, `n5-engine.js`, and `n5-game.js`. Styling layers are `theme.css`, `slide.css`, `pairs.css`, `n5.css`, and `responsive.css`. Previous game scripts are retained but not loaded.

## Curriculum scope

24 selected characters from the JLPT Sensei N5 study list, arranged in three chapters / 15 levels. This is a composable subset, not all N5 kanji and not an official JLPT syllabus. The interface discloses the scope and sources. Components are visual construction aids, not historical etymologies; 本 and 白 use stroke additions. The rare component 𠂇 is rendered with an inline two-stroke SVG to avoid missing glyphs.

- Chapter 1: 休 男 分 名 外 何 見 国
- Chapter 2: 時 間 聞 話 語 読 校 友
- Chapter 3: 二 三 天 本 白 百 左 右

The first level has four required target recipes on the same full board size as every other level. Subsequent discovery levels introduce two new targets with prior material as review. Chapter review levels require all eight chapter targets. Every character has exactly one introduction level; all 24 are mandatory somewhere in the sequential path.

Sources:
- https://jlptsensei.com/jlpt-n5-kanji-list/
- https://www.jlpt.jp/e/faq/
- https://github.com/cjkvi/cjkvi-ids

## Gameplay invariants

- Dimensions are columns × rows, fixed across all 15 levels: desktop 7×5 (34 tiles / 17 unique pairs, one blank), mobile 5×7 (34 tiles / 17 unique pairs, one blank).
- Desktop is a viewport at least 900 px wide. On load and viewport changes, the current run and undo history transpose between desktop 7×5 and mobile 5×7. Conversion waits until any move/refill animation finishes. Adjacency, score, targets, pending refill and the run benchmark remain unchanged. The 24 recipes use pair-specific colors and gemstone-cut silhouettes with faceted highlights; both tiles in a pair share the same color and outer shape. The Kanji stays centered inside each gem while the square board cells keep the slide grid aligned. Newly spawned pairs use a color not currently on the board or just merged.
- Required targets enter first, followed by the level's previously scheduled material, then supplemental recipes from the 24-character set to fill every pair slot. Supplemental matches award points and album entries but do not replace required targets. A recipe is never duplicated simultaneously; future characters can be discovered early and will still be required in their assigned levels.
- A tap slides a tile when it has exactly one adjacent blank. With two choices, tapping selects the tile and highlights both blank destinations; the player taps a destination or swipes in its direction. Keyboard selection plus arrows and keyboard activation of blank buttons are supported. No diagonal movement or swapping with occupied cells.
- Each active color has exactly two complementary parts and exactly one unique target recipe. Two same-colored tiles meeting orthogonally disappear and score 100. Their approach direction need not match the written character's layout; the reveal explains its actual layout.
- The highlighted objective and level-completing matches show the learning popup. Other matches use a shorter fusion and a nonblocking card with a reopen button, including new discoveries; settings can restore the full popup for every match. There are temporarily two extra blanks while input is locked. The saved pending record includes the complete refill plan.
- A unique replacement pair enters cells at least five Manhattan steps apart. Existing tiles stay in place whenever possible; if needed, the engine searches safe one-cell shifts, then a one-tile relocation, then a contact-free layout fallback. Among equally short safe refill paths, prefer preserving the current target pair. Refill rule 7 can use cells outside the just-cleared pair: two central cleared cells on mobile cannot reach a five-step separation, so requiring one new stone to occupy those cells could deadlock. Rules 6 and 7 remain loadable. A violet highlight previews affected pieces. The board returns to its original blank count.
- Missing required targets have refill priority. Otherwise use an inactive recipe from the full 24-character set. The previous four matched recipes are temporarily excluded; the replacement also uses a different unused color from the pair just cleared.
- A level ends only when every assigned target is found in that run, regardless of points or review matches. There is no timer or move limit. New runs use verified per-level/per-device routes from course-plans.js. Three stars allow ceil(1.25 × guided route length), two allow ceil(1.9 × route length); completion always earns one. These are guided baselines, not proven optimal solutions or human difficulty ratings. Legacy runs retain their 8×/16× target-count thresholds. Hints never subtract stars.
- A bounded breadth-first hint searches for a required match. If its full-board search budget is exhausted, an abstract target-pair/blank search takes priority over a review match. Both the tile and destination are highlighted; hints never change the board.
- Undo restores the exact board, random state, score and in-level found targets (three uses). Album entries stay collected because the player already viewed the reveal.

## Persistence and navigation

Storage key `kanji-pop-n5-v1`, curriculum id `n5-compose-24-v1`, engine schema v9. Saved v7/v8 runs and undo history migrate to the fixed layout. Existing full-size boards retain positions; smaller boards are repacked with unique supplemental pairs. Score, moves, found targets, pending reveal identity, album and level results are preserved. A pending refill is rebuilt if its board expands. Prior free-play v6 data is left untouched and not imported. The envelope saves the current board, pending reveal/refill, undo history, album, completed-level best results, current view and audio preference. Completed levels unlock the next one. Replaying preserves the album and best results. Album entries mean discovered, not mastery.

## Verification

From the chat workspace:

- `node work/fixed-grid-check.cjs`: solves all 15 levels in both modes, verifies all 24 targets, exercises more than 9,000 transitions, checks complementary unique pairs, safe refills, explicit blank choices, and legacy migration. Results: `work/fixed-grid-check-results.json`.
- `node work/fixed-grid-browser-check.cjs`: checks 5×6 / 4×5 at 320–1440 px, tile targets, no overlaps or horizontal overflow, resize stability, viewport-dependent restarts, explicit blank selection, keyboard, hints, undo, and old pending-reveal/history migration. Results: `work/fixed-grid-browser-results.json`.
- `node work/grid-touch-check.cjs`: checks mobile touchscreen selection, destination taps and swipes, plus a complete desktop level with reveal/refill and saved-run reload.
- Earlier `grid-engine-check.cjs`, `grid-browser-check.cjs`, `n5-*check.cjs` and `responsive-check.cjs` files describe prior layouts and are retained as historical checks; their one-blank/count assumptions are no longer current.

Browser checks require access to the local listener. Run only on localhost as required by AGENTS.md. Never publish or push.

## Responsive interface

`responsive.css` defines the main layout; gemstone, fusion, reveal and experience styles load after it. At widths of 900 px and up the app fills the page: top navigation, three-column roadmap / album, and a gameplay summary beside the board. Smaller screens retain the candy mobile shell, with compact mission chips, tool row and viewport-aware board height. Tile hit areas stay at least 44 px high; very short phone viewports may scroll to preserve those targets.

The desktop play stage scales with the available viewport up to 1290 px. Tile hit targets stay at least 44×44 px even when a desktop run is resized to a phone viewport. Very short phones may scroll rather than shrink the tiles. The curriculum, album and unlock sequence are unchanged.

## Experience update

- Interactive opening: explain the single marked gem, finding its partner, then routing the blank. Skip/replay is supported without changing the board dimensions. The first three selected openings require 4, 6, and 9–11 guided moves before the first match.
- The first unfinished recipe in the level target order supplies one marked source gem, chosen by stable component side/id. Its halo follows that same piece through movement, refill and reload. Selecting a piece no longer reveals its partner. The Hint button highlights only the current source gem's partner for two seconds and does not suggest a move.
- The mission panel shows the marked source gem and progress slots. Future result characters, meanings and formulas stay hidden. The heading says “Đã khám phá X/Y chữ”, with the explicit goal to collect all target characters in any order. Matching any later target grants credit immediately; subsequent objectives skip it. Other matches still grant points and album discoveries. Completion uses this run's found targets, not album membership.
- The source marker follows the exact outer contour from the gemstone artwork. Each of the seven cuts has its own traveling-light rhythm and vertex sparkles: triangular corners, segmented hexagonal edges, twin brilliant trails, beveled-square accents, five-point topaz glints, diamond pulses and a pointed sapphire sweep. The contour never rotates away from the stone or crosses the glyph. Only the active board piece receives the decorative SVG; its phase follows the page clock across redraws. The focus also includes a cyan/violet/pink/gold gradient, an outer segmented seal, three colored currents, bright comet heads, vertex flares and 24 bounded outward stardust particles. Light quality removes particles and secondary moving layers; reduced-motion mode retains a static multicolor contour. These effects are decorative and do not change pair colors or matching rules.
- The reveal first brings components into their written relative positions, then shows the whole kanji. This is a visual composition aid, not a stroke-order lesson or an etymology claim.
- Album entries distinguish discovery from subsequent encounters. “Reviewed” counts encounters and does not claim recall or mastery. All 24 characters remain mandatory somewhere in the 15-level course.
- Each new/restarted level opens a centered, illustrated guide with a sliding same-color/same-shape pair, the empty-cell rule, the optional nature of the halo and the current target count. Starting play dismisses it and persists acknowledgment for that run; resuming the same run does not repeat it. Help can reopen the guide. Pending discoveries and completion screens take precedence over the entry guide.
- Completing each five-level chapter unlocks a board theme, a decorated album chapter page and two selectable fusion themes. Automatic mode continues to rotate through six effects. Rewards and preferences persist locally.
- Effect quality has auto/light/full modes. Auto samples animation frame intervals, reduces particle count/render resolution on slower devices, and respects reduced-motion settings. Hiding the tab cancels the active overlay, suspends audio, and saves the run.
- Extra preferences and playtest data use kanji-pop-experience-v1. No telemetry is sent to a server. At most 800 recent events and 30 manually entered observations are stored. Logging can be disabled and data exported as JSON; a copyable JSON fallback is shown if browser download policy blocks the file.

### Current checks

Run `node work/build-course.cjs` from the chat workspace to regenerate and validate guided routes for all 30 level/layout combinations. This checks engine validity after every move and refill. Re-run if spawn or movement logic changes.

Run `node work/experience-check.cjs` against localhost for onboarding, responsive layout, keyboard navigation, settings persistence, local export, new/repeated matches, legacy-run restoration, album states and chapter rewards. It uses isolated browser profiles; fixture feedback is not real participant data.

Run `node work/experience-completion-check.cjs` for a full chapter-ending level through browser controls, including a hint, three-star award, chapter unlock and reload without duplicate completion events. `node work/fusion-check.cjs` covers animated discovery/refill and overlay cleanup on desktop, mobile and reduced-motion mode.

Older fixed-grid browser checks contain historical layout assumptions. Use the current 7×5 / 5×7 invariants above when assessing failures.

`node work/objective-check.cjs` validates all 30 routes, stable source identity, five-cell refill spacing and the central-cell deadlock regression. `node work/objective-browser-check.cjs` checks one marker, hidden future recipes, two-second optional hints, movement/reload persistence, ahead-of-order credit, advancement and undo at 1440×900, 1366×768, 390×844 and 320×568. The older mission-check.cjs describes the superseded reveal-all-targets interface.

### Human playtest protocol

Use 8–12 Vietnamese adults who are new to or unfamiliar with Japanese, as selected by the owner. Vary phone sizes and devices. Ask them to start without a verbal explanation and play the first three levels. Observe time to first self-directed match, invalid taps, requests for hints, and whether refill movement causes confusion. Avoid coaching until they ask.

After a short break, ask which characters or meanings they remember before opening the album. Record their answer, ease-of-understanding rating and willingness to continue in Cách chơi → Tùy chỉnh → Buổi chơi thử. Export each session's JSON, noting device and participant separately without identifying details.

Compare balanced versus full popup pacing and auto versus light quality. Assess slow frames on actual phones and whether they choose another level voluntarily. Automated route completion does not establish engagement, retention, accessibility or learning efficacy; these remain human-validation tasks.

`node work/level-intro-check.cjs` verifies centered guides without scrolling on desktop, small/normal portrait phones and landscape, focus/input lock, dismiss/resume/restart, ahead-of-order target credit, bonus-only discovery without progress inflation, stable halo identity and the next-level target count. This is the current browser check for the revised discovery pacing.

### Facilitator dashboard and measurement integrity (2026-11-08)

Open `http://127.0.0.1:8765/study-dashboard.html`, or follow the link from the playtest modal. It reads only isolated study logs, accepts version-2 per-study JSON exports, and recomputes summaries from validated retained events. Snapshot imports replace older exports by study ID; duplicate/older snapshots are ignored and same-time differing snapshots are reported as conflicts, never concatenated. Imported files remain in page memory; keep original files for re-import. The aggregate export is a result summary, not a backup of raw sessions.

Facilitator observations default to unobserved and use separate `kanji-pop-study-review-<id>` keys. Record understanding of movement, optional halo and completion; distinguish voluntary stopping from time limits and technical interruptions. Record free recall without inventing learning outcomes. No game saves are modified by this page. Session counts are not verified unique people; missing completion is unknown, not failure.

The median first-match time excludes sessions with dropped events, missing observed starts, logging gaps or missing consent/timing. Visible time includes guides and visible pauses. Turning logging off records a measurement-boundary marker before stopping action logging. An unrecorded first match is not replaced by a later match; failed observation writes roll back so exports do not falsely contain accepted answers.

Checks: `node work/study-measurement-audit.cjs` (8 VM regression cases), `node work/study-cohort-check.cjs` (validation and aggregation), `node work/study-dashboard-check.cjs` (1440/390/320 px, import conflicts, safe text, default observations, storage failure, save isolation, no external requests), and `node work/study-browser-check.cjs` (isolated game sessions and reporting). These use synthetic data, not participant evidence.

The crystal material now uses translucent body/core fills, bright rim reflections and staggered facet sweeps. Pair palettes, shapes and glyph geometry are unchanged. The board includes a decorative clipped cosmic-depth container: a slowly drifting nebula and two seamless repeating star fields moving at different speeds. Gem and fusion layers remain outside that clipping container. Light quality retains the far-star drift; reduced motion makes all background layers static. Current focus-preview-check also verifies background movement and reduced-motion behavior at 1440/390/320 px.

### Mobile full-viewport layout

`mobile-fullscreen.css` removes the outer phone card below 900 px and uses the same sky-blue palette as desktop around the cosmic board during play. Safe-area-aware regions reserve space for the header, discovery progress, board, contextual message and bottom action dock. A ResizeObserver fits the 5×7 board to its available region without changing its size when coaching or quick discoveries appear. The dock has Undo, a prominent Hint and Menu; Menu contains Help, Album, Map, Settings and Restart. Normal map/album navigation remains available outside play. Landscape widths 650–899 px place progress and controls beside the board. Very short viewports retain minimum touch sizes and may scroll. The desktop grid and routes remain unchanged. Legacy mobile 4×5 runs are validated and expanded to 5×7, preserving counters, discoveries, completion and pending reveals; their positions are rearranged. Undo history is migrated by the same path.

`node work/mobile-fullscreen-check.cjs` checks full-width layout, visible controls, stable board position when coaching closes, touch moves, Album/map/menu round trips and progress preservation at 320×568, 360×640, 390×844, 768×1024 and 844×390. The board measures 374 px wide with 85 px tile targets at 390×844, and 242 px with 52 px targets at 320×568. `node work/mobile-late-level-check.cjs` covers eight target slots and discovery notices at small portrait, normal portrait and landscape sizes. See MOBILE-UI-REVIEW.txt for skill references and the grid comparison. These are browser-emulation checks, not human playtest results.

### Mobile 5×7 update (owner-selected)

Supersedes the earlier 4×5 layout recommendation and measurements above. Mobile now has 5 columns, 7 rows and one blank at every level. Desktop remains 7×5. Mobile uses the exact desktop sky gradient and matching cyan/purple/yellow controls; the cosmic board material stays shared. Small or short viewports can scroll to preserve 44 px touch targets. Measured: 320×568 needs 629 px page height (44 px tiles), 390×844 fits with 63 px tiles.

Checks: `node work/mobile57-engine-check.cjs` validates all 30 new routes, distance-five refills, 125 legacy mobile snapshots including pending/completed states, and unchanged desktop plans. `node work/mobile57-browser-check.cjs` checks 5×7/7×5 geometry, palette, movement, menu, reload and stable layout at 320/360/390/768/844/1440 widths. Progress-store and long-content popup checks also pass. Older fixed-grid/mobile tests have historical dimension or no-scroll assumptions.

Viewport restoration regression: `node work/layout-transpose-check.cjs` verifies 1,388 states for reversible transposition, preserved adjacency and pending refill equivalence. `node work/layout-transpose-browser-check.cjs` reproduces a PC save opened at 490px, live resizing both ways, reload and undo without progress loss. This supersedes earlier keep-shape-on-resize behavior.

### Compact mobile HUD — latest layout

Applied and installed the GitHub game-ui-ux skill (gamedev-skills/awesome-gamedev-agent-skills, skills/disciplines/game-ui-ux). Skill path: C:/Users/Admin/.codex/skills/game-ui-ux/SKILL.md. Uses container-based layout, safe-area insets and viewport validation. This update supersedes the mobile measurements above.

Portrait reserves 44px for the header, 36px for progress, 44px for contextual feedback and 44px for horizontal actions, with 4px gutters plus safe-area insets. The board takes the remaining region up to available width. Moves, match count and star thresholds remain available in Menu rather than adding two footer rows. Progress includes all eight target slots when needed. Feedback has stable space so the board does not jump on tutorial dismissal or a quick discovery. Landscape gives the board the full viewport height between safe margins, with information and controls beside it. Desktop styling, game rules and 5x7/7x5 transposition are unchanged.

Browser-emulated measurements (tile hit area side / page height):
320x568: 45.8px / 568px (previously 44px / 629px)
360x640: 56px / 640px (previously 45.6px / 640px)
390x844: 68.4px / 844px (previously 63px / 844px)
768x1024: 110.8px / 1024px
844x390: 45.4px / 390px (previously 44px / 485px)
1440x900: 96.2px / 900px (unchanged desktop)

Checks: mobile57-browser-check.cjs (six viewports, touch, menu, reload), mobile-late-level-check.cjs (eight slots and discovery notices), layout-transpose-browser-check.cjs (saved PC run, live resize, undo), mobile-space-check.cjs (no page scroll at 320/390/844, coaching fits, menu statistics reachable). These are browser tests; physical-device comfort remains to be evaluated.

### Mobile spacing and alignment refinement

Latest pass replaces independently stretched portrait regions with one board-width frame. Header outer buttons, progress, board, contextual feedback and action dock share left/right alignment. Main gaps use 8px; portrait heights <=680px use 4px consistently with 8px minimum safe margins. Standard minimum edge inset is 12px plus applicable safe-area handling. Extra vertical room is balanced outside the complete play group rather than inside the board region. Header badge/score are both 32px high; action buttons have equal widths and 48px height. Landscape side columns are symmetrical. Board stays 5x7 and desktop styles remain unchanged.

mobile-spacing-check.cjs measures aligned bounds, all four inter-region gaps, equal top/bottom outer margins, equal action widths, touch heights and no page scrolling at 320x568, 360x640, 390x844, 430x932 and 768x1024. mobile57-browser-check, mobile-space-check and mobile-late-level-check also pass, including landscape 844x390 and eight targets. Current cell hit widths are 44px at 320x568, 54.2px at 360x640 and 65.2px at 390x844; the slight reduction buys consistent gutters.

### Gem material B — visual polish

Replaced the washed-out translucent SVG face treatment with layered directional facet gradients, a thin polished bevel, split crown facets, a radial reading face, a restrained studio reflection and a lower internal caustic. This is stylized vector lighting, not physical ray tracing. Existing 24 palette assignments, seven silhouettes, label centers, target outlines and hit areas are unchanged. Every consumer uses KanjiGemArt.render, including board tiles, composition gems and discovery reveals. Existing edge-only sheen/twinkle, light-quality and reduced-motion controls remain. No external image assets or runtime requests were added.

Checks: crystal-material-check.cjs verifies all 24 silhouette/label mappings and unique SVG IDs, and renders a seven-cut before/after comparison at work/crystal-material-comparison.png. focus-preview-check.cjs passes at 1440/390/320 for marker identity, movement/reload, all seven contours, light and reduced-motion behavior. content-layout-check.cjs passes long discovery content/formulas at the same widths. Screenshots inspected on desktop and minimum 320px mobile; real-device visual preference/performance still requires playtesting.

### Previous interpretation of sample 2 — superseded below

The earlier implementation interpreted sample 2 as B; the owner subsequently corrected this using the realistic ruby screenshot. That earlier version implemented B across all seven cuts using image_gen-generated transparent sprites. It is retained only as an earlier art version, not the current selection.

Runtime files: dist/gem-style-b/*.webp, seven 512px transparent sprites totaling 169,588 bytes. High-resolution originals are preserved in art-source/gem-style-b; full built-in Imagegen prompts and asset mapping are in gem-style-b-prompts.json. work/encode-gem-style-b.cjs reproduces encoding from the sources. A/C comparison assets remain in gem-study-assets and are not fetched by gameplay. These are rendered sprite illustrations, not realtime 3D meshes.

Validation: style-b-check.cjs passes at 320/390/1440px for all seven successful sprite requests, 17 paired identities, alpha metadata, byte budget and JS errors. focus-preview-check passes live markers, seven contours, movement/reload, light quality and reduced motion; content-layout-check passes long discovery notes and formulas at the same sizes. Visual board screenshots reviewed at desktop and mobile sizes.

### Corrected selection — realistic ruby from the owner's screenshot

The supplied screenshot identifies ruby-a-realistic.png as the selected artwork. The square source is copied directly from that original (SHA256 identical), not regenerated. Six additional cuts use built-in Imagegen with that same original as their material reference: sharp precision facets, layered internal reflections and deep translucent ruby. All consumers now load dist/gem-realistic/*.webp. The existing palette tint and white Kanji overlay remain; pink pair 3 displays the original ruby color directly. No layout or game-rule changes.

Seven transparent 512px WebP sprites total 308,142 bytes. Original PNG sources are in art-source/gem-realistic; prompts and file mapping are in gem-realistic-prompts.json. work/encode-gem-realistic.cjs reproduces encoding. Previous B assets remain available but are no longer loaded by gameplay.

Validation: realistic-gem-check.cjs passes at 320/390/1440px for seven successful sprite loads, 17 matching pair identities, alpha, dimensions, byte budget and no JavaScript errors. Mobile and desktop screenshots inspected; focus and long-content checks cover the shared renderer.

### Current version — restored previous sprites at owner's request

The owner requested reverting the latest realistic-ruby change. The shared renderer again loads dist/gem-style-b/*.webp with material premium-stylized-b. This supersedes the selection recorded above. The realistic artwork is retained as an unused alternative. Layout, gameplay and saved progress are unchanged.

### Latest material — hybrid clear crystal

Owner requested combining the clearer optical depth of the realistic ruby with the simpler broad facets of B. Seven new transparent sprites were generated with built-in Imagegen: broad polished crown planes, softened bevels, subdued internal reflections and luminous lower-edge caustics, with calm reading tables. All shared render consumers now use dist/gem-hybrid/*.webp and material hybrid-clear-crystal; existing matching pair palettes, shapes, label positions and focus behavior remain. Earlier source sets are retained as alternatives. Gameplay, grid and saved progress were not changed.

Runtime: seven 512px alpha WebP sprites, 210,308 bytes total. Sources: art-source/gem-hybrid. Full reference roles, prompts and source mapping: gem-hybrid-prompts.json. Reproducible encoding: work/encode-gem-hybrid.cjs. This is illustrated crystal depth, not realtime physical refraction.

Verification: hybrid-gem-check.cjs checks 320/390/1440px sprite loading, alpha metadata, 17 matching pair identities and JavaScript errors. Shared focus and long-content browser checks cover contour markers, movement/reload, reduced motion and discovery/formula content. Screenshots reviewed on mobile and desktop.

### Objective marker follows the gemstone's own color

The marker now inherits the tile's active --tile-mid palette. Aura, outline gradient, moving trails, outer seal, corner flares, dust and optional mate-hint glow use that hue with lighter white-mixed highlights. This replaces the fixed cyan/pink/yellow spectrum; contour geometry, animation rhythms, target identity and reduced-motion/light-quality behavior remain unchanged. No separate color table can drift out of sync with the gem palette.

Validation: focus-preview-check.cjs passes at 1440/390/320px for live marker identity, movement/reload, hints, seven contours and motion settings. Reviewed the seven-cut color preview and mobile board screenshot.

### Elemental objective ornaments

Marked gems now add palette-linked perimeter motifs: yellow thunder (branching bolts and charge), purple/pink magic (sigils and spell circuit), blue/teal water (waves and rising bubbles), red/orange fire (flames and embers), green nature (vines and leaves), silver/slate ice (snow crystals), brown earth (floating crystal shards). The 24 palette slots have explicit element assignments independent of their seven cut silhouettes. All ornament colors inherit the gem's own hue and light highlights.

The ornaments are procedural SVG in the existing marker, with 3–8 motif groups per marked tile and no additional image/network assets. Generic glitter is subdued to make the elemental shapes readable. Geometry remains near the perimeter, pointer events stay disabled, and the central glyph is untouched. Light quality stops elemental animation and shows fewer motifs; reduced motion keeps static ornaments. No changes to gameplay or gem sprites.

Validation: focus-preview-check.cjs passes at 1440/390/320px for live marker behavior, hints, movement/reload and motion preferences; element-focus-check.cjs checks all 24 palettes, seven element types, motif bounds, light/reduced-motion and no JavaScript errors. Seven-cut preview and 320px mobile board visually reviewed.

### Fusion inherits the matched pair's element

Live merges pass the pending matched pair palette to KanjiFusion.play, which resolves through KanjiGemArt.elementFor, the marker's shared mapping. Thunder maps to the existing lightning renderer; magic, nature, fire and water retain their themed animation. Added distinct ice crystal growth and earth shard bursts for the remaining marker types, and made lightning golden to match yellow gems. Off-target matches use their own pair's element, not the currently guided pair. Tier/detail progression, full discovery vs short off-target pacing and reduced-motion behavior remain unchanged.

The favorite-effect selector and obsolete effect-unlock promises were removed, as they could contradict the visible marker. Existing saved favorite settings remain readable for backward compatibility but no longer override live fusion. Chapter backgrounds and album rewards remain. Fireworks is retained for explicit effect previews; live pairs do not randomly rotate through effects.

Validation: element-focus-check.cjs compares all 24 rendered marker elements against fusion resolution even when a conflicting legacy favorite and sequence are supplied. fusion-check.cjs verifies guided and off-target live merges on desktop/mobile and reduced motion. fusion-edge-check.cjs renders eight themes at four corners and five animation times on 1440x900, 390x844, 320x568 and 844x390, verifying cleanup and no clipped edge pixels.

### Three directed fusion motion studies

Lightning, water and magic now use distinct normalized timelines: pull (0–27%), compression (27–36%), impact (36–60%) and settling (60–100%). The two matched gem sprites/glyphs are captured after sliding, move toward the safe fusion center and shrink away at the impact beat. The result appears only at that beat with a restrained scale overshoot. The same timeline fits both full discovery and the existing 850ms off-target burst; no changes to scoring, course, saves or refill logic.

Lightning builds a connection between the pair, releases two directional branched discharges and a few decelerating fragments. Water uses two curved tapered ribbons, a translucent splash lip and drops with gravity. Magic draws one seal with three geometric sigils, compresses it, then releases a small set of rising fragments. These three bypass the earlier shared star showers, orbit rings and decorative Unicode glyphs. Other elements retain their current effects. No generated textures or external assets were introduced.

Their idle markers keep the gem-colored contour but show only two elemental accents, suppressing generic stars/dust and extra orbit tracks. Full/light/reduced-motion behavior remains. Local preview: /fusion-motion-preview.html, using the same runtime implementation, with replay buttons for all three themes.

Validation: fusion-check.cjs verifies real guided/off-target merges and cleanup on desktop/mobile/reduced motion; focus-preview-check.cjs covers marker identity, geometry and motion preferences; fusion-motion-check.cjs verifies ingredient/result phase timing for all three themes at 390/1440px and reduced-motion cleanup. fusion-edge-check.cjs covers all eight themes/four corners/four viewport sizes. Mobile motion snapshots inspected at compression and impact. Physical-device feel and player preference remain to be assessed.

### Softer VFX material pass

The three motion studies now emphasize filled material rather than line drawing. A tapered quadratic ribbon renderer builds varying-width translucent bodies, folds and soft color layers. Water uses uneven curling splash sheets instead of stroked ellipse rims; magic uses two volumetric-looking energy folds and dissipating glows instead of a geometric seal, triangles and line trails. Lightning retains only a fine angular hot filament, surrounded by clustered soft plasma glows and filled energy. This is bounded 2D canvas rendering, not a fluid simulation. No new image assets or dependencies.

Magic/water idle accents likewise use small filled wisps and liquid shapes, with softened contour light. Phase timing, gem movement, pair-element mapping and other elements are unchanged. Checked all three motion previews at mobile/desktop sizes, all palette markers and reduced-motion/light settings; edge-pixel checks cover eight themes/four corners across four viewports.

### Larger marker and lighter button focus treatment

Removed the dark SVG contrast contour entirely. The marker now scales to 107%, with a broader soft aura (18 units), thicker moving light and up to six elemental accent groups instead of two. Magic/water accents add secondary translucent folds and droplets; lightning has a soft bloom layer. Colors still inherit the gem palette, and the glyph remains above the decorative overlay. Light quality omits secondary detail; reduced-motion behavior is preserved.

Removed the thick external button focus outlines from the shared game theme and progress controls; keyboard focus uses brightness/underlined text instead. The older dark tile-focus filter is also removed. Browser checks at 390/1440px confirm the intro button has no outline while focused/hovered, and no dark marker path exists. focus-preview-check.cjs passes at 1440/390/320px; intro, live board and seven-cut screenshots visually reviewed.

### Marked-only star sparkle, thinner halo

The objective halo is now 104% scale with a 12-unit soft aura and thinner outline. Six fixed-position four-point stars pulse at staggered intervals around its perimeter. Moving perimeter trails, orbiting light, facet sweeps and the generic gem glint animations are disabled. Ordinary gems retain their baked static highlights; only the currently marked tile has continuous star sparkle. Element identity is retained, with the magic/water accent films static so they do not read as sweeping highlights. Low quality uses three stars; reduced motion keeps static stars.

Validated at 320/390/1440px: exactly one marked tile, six star animations, zero animated ordinary gem artwork and no visible facet/perimeter sweeps. focus-preview-check.cjs covers movement/reload, seven cuts, hints and motion preferences; mobile board screenshot reviewed.

### Full learning presentation for every successful pair

Every merge now plays its full pair-element VFX and opens the complete learning card, including off-target pairs and already-known characters. The card stays open until Continue; no automatic refill/quick-card path remains. Removed the balanced/full pacing selector and normalized legacy saved pacing to full. Pending matches restored after reload also open the learning card without awarding score again. Reduced motion still skips animation and opens the same card.

Existing scoring semantics remain: each merge earns 100 points, first discoveries join the album once, and any level target is credited immediately even if found before its guided turn. CurrentTarget skips all previously found targets. Off-target discoveries do not consume the current target. Repeated discoveries show the review label rather than claiming a new album entry.

Validation: fusion-check.cjs covers guided, off-target, repeated off-target and reduced-motion merges, full effect duration, full card fields, +100 credit, album uniqueness, correct target credit, pending reload without duplicate score and cleanup. content-layout-check.cjs passes long cards at 1440/390/320px with no modal overflow.

### Removed curled pink/purple marker ornaments

Owner rejected the curled wisps/orbs and heavy pink frame on the marked ruby. Magic idle markers now render only a thin gem-colored contour and staggered stars. Removed their ornament geometry, reduced their aura to 6 units with a fixed low opacity, and softened the gem glow. Magic's fusion effect and other elemental marker types remain unchanged. focus-preview-check.cjs passes at 1440/390/320px; seven-cut preview inspected. element-focus-check.cjs expects no magic ornament groups while retaining the same pair-to-fusion element mapping.

### Sprite-aligned focus without an outer frame

Supersedes the thin contour above: removed visible polygon outlines, polygon auras and elemental perimeter circuits for all marked gems. A small color-matched glow now follows the actual sprite alpha. Stars sit inside the bevel instead of outside an enlarged polygon, with smaller staggered twinkles; no sweep passes over the reading face. Elemental motifs and merge effects remain intact. Verified marker identity, movement/reload, seven shapes and reduced motion at 1440/390/320px with focus-preview-check.cjs; inspected the seven-shape visual preview.

### Target recognition throughout the sparkle cycle

Two larger facet stars now breathe between 80% and 100% opacity rather than disappearing. Both survive light quality; reduced motion holds them still. Other stars retain their staggered twinkle. This prevents the magic marker, which has no surrounding ornament, from depending entirely on intermittent stars after removal of the outline. No border was restored and gameplay/target order is unchanged.

Validation: marker-visibility-check.cjs checks target presence throughout all 30 course routes (1,240 moves, 118 merge continuations) and samples 60 seconds of all 24 palette markers in full/light modes, plus reduced motion. focus-preview-check.cjs verifies live movement, reload, optional hint and marker identity on PC/mobile.

### Persistent target pointer independent of gem highlights

The always-on facet stars were still visually lost in the pink gem's bright reflections. A small, static downward pointer now sits immediately above the marked gem, using its color with a white stroke. It remains present in full/light/reduced-motion modes; it does not wrap the gem or reveal its partner. Sparkles remain decorative. This replaces reliance on sparkle visibility alone for target identification.

Validation: level5-marker-check.cjs loads a valid level-5 fixture with 3/8 targets found, 500 points and pink 夕 as the current anchor. At 476/390/320/1440px it checks exactly one visible pointer, minimum 20px width, placement above the tile and persistence after reload and quality changes. Full-page mobile screenshots inspected. focus-preview-check.cjs passes movement/reload identity and all seven cuts.

### VFX-only target identification (pointer removed)

Owner explicitly rejected the pointer above. Removed its markup and CSS entirely. Target recognition now uses a continuous, gem-colored radiance pulse following the sprite alpha, larger stars straddling the bevel against the dark background, and twelve small drifting stardust particles. Two stars stay visible throughout the cycle. No polygon frame, sweeping highlight, or arrow is rendered. Only the target gem pulses; other gems remain static. Reduced motion retains a fixed glow and stars; light quality reduces dust density.

Updated level5-marker-check.cjs verifies no pointer, changing glow at two animation phases, static non-target gems, full/light/reduced motion and reload at 476/390/320/1440px. Inspected the mobile level-5 screenshot. marker-visibility-check.cjs passes all 30 routes and 24 palettes.

### Brighter VFX with movement along each gem cut

Added two small bright comet heads with six fading tail particles each. Motion paths derive from each cut's perimeter, inset slightly and rounded at corners; the path itself is never stroked or displayed. Duration scales with perimeter length for a consistent travel speed. Strengthened the sprite-alpha radiance pulse and facet stars. Light quality keeps one comet; reduced motion hides traveling particles and retains the static identification glow. Other gems remain unanimated.

Validation: rim-motion-check.cjs samples 16 motion phases on each of seven distinct paths, checking actual rendered positions remain within four SVG units of their gem bevel. Level-5 mobile/desktop and existing focus checks pass. Inspected the seven-cut preview and mobile board.

### Whole multicolor VFX circulation

Owner clarified that the whole VFX must circulate, rather than stars orbiting stationary decoration. Replaced the previous marker rendering and accumulated marker CSS with three moving energy bands. Each band carries its bloom, bright body, fine core and dust around a rounded path derived from the gem cut. The gem's color leads, with cyan and pink prismatic accents. Removed orbiting stars and fixed elemental ornaments. The motion path retains the gem silhouette instead of rotating a rigid polygon. Fusion's pair-to-element mapping remains unchanged. Light quality preserves the moving colored bands while reducing glow cost and dust; reduced motion keeps three separated static color segments.

Validation: actual band stroke offsets change over time; seven paths follow their respective bevels across 16 sampled phases. Level-5 fixture, live movement/reload, all 24 palette visibility and reduced-motion checks pass. Mobile and seven-cut screenshots inspected.

### Gem-toned elemental circulation

Replaced shared cyan/pink accents with white-mixed shades of the marked gem's own hue. Added seven distinct moving material details: branched electricity, curling water and droplets, flame tongues, magical glyphs, leaves, rock shards and ice crystals. Three details travel with the energy streams along the same cut-specific path; the band thickness, highlights and segmentation also vary by element. This preserves whole-effect circulation, not stationary ornaments around orbiting stars. Light mode retains two material details; reduced motion places them at three separate positions. Fusion still uses the same pair-to-element mapping.

Validation: element-focus-check.cjs checks all 24 palettes, seven distinct material artworks, actual material displacement, hue preservation within 0.04 normalized RGB-chroma error and unchanged fusion mapping. Level-5 checks and seven-cut motion/focus checks pass on mobile/desktop. Inspected both the palette sheet and mobile board.

### Three VFX material studies for owner selection

Local comparison at `/vfx-style-preview.html`: three variants share one deterministic 5×7 board, one purple triangle, the same target position and a synchronized clock. Study 01 uses tapered fluid energy ribbons; study 02 uses a generated transparent 4×4 magical-smoke flipbook mapped continuously around the bevel; study 03 places light inside the crystal and refracts it through its facets. The sprite renderer uses inverse texture mapping to avoid seams from overlapping image strips. No production game rendering or save logic is changed by the comparison.

Desktop shows all three studies; mobile uses tabs. Controls include pause/resume, replay, 0.5× playback, close-up and center/corner placement. Selection persists only under `kanji-pop-vfx-study-choice-v1`. The preview pauses when hidden and starts paused for reduced-motion users. Generated sprite provenance and exact built-in imagegen prompt: `art-source/vfx-study/provenance.json`; original alpha PNG: `art-source/vfx-study/magic-ribbon-atlas.png`; runtime WebP: `dist/vfx-study-assets/magic-ribbon-atlas.webp` (422,342 bytes). This is a material prototype, not a final approved commercial asset.

Validation: `work/vfx-style-preview-check.cjs` passes at 1440/390/320px: matching board layouts, visible canvas content, synchronized playback, pause/slow controls, zoom, corner switching, saved choice and unchanged gameplay-storage sentinel. No remote requests, page errors or horizontal overflow. Reduced motion starts paused. Inspected full mobile board and desktop close-up comparison; removed initial strip-rendering seams before completion.

### Study 04: thicker sprite plus inner energy

Added a fourth local study combining sprite circulation with crystal-core refraction. Sprite width increases by 1.6× through inverse texture-coordinate mapping, preserving the existing atlas's detail and perimeter speed. Expanded the raster surface to accommodate the wider plume. The core's circulation period is synchronized to the sprite's 5.8-second cycle. Kanji stays on the foreground layer. Original three studies remain available for comparison.

The comparison now defaults to study 04 on mobile; `?sample=4` links directly to it. Desktop presents four studies in two columns with study 04 first. Existing saved choices remain valid; choice 04 can be saved independently of gameplay. Updated preview checks pass at 1440/390/320px, including all four effects, controls, choice persistence, reduced motion and untouched game progress. Inspected the mobile close-up of study 04.

### Study 05: hybrid with a thin fluid-energy layer

Added study 05 alongside study 04, retaining the 1.6× sprite and core layers and adding the fluid ribbon at half its original width and 80% opacity. Fluid circulation uses the same 5.8-second cycle as the other layers. This adds a slender moving highlight through the smoky material without thickening the whole outer plume. The glyph remains above all effects.

`?sample=5` opens the new study; it is also the mobile default. Desktop places studies 05 and 04 together first. Mobile tabs scroll horizontally and bring the active sample into view. All five choices remain independently selectable. Preview checks pass at 1440/390/320px; inspected the new mobile close-up. Production gameplay is unchanged.

### Approved three-layer elemental target marker — production

Study 05 is now applied to every marked gem, across all 24 palette identities and seven cuts. `target-vfx.js` combines the 1.6x material sprite, light refracting through the core, and a half-width / 80%-opacity fluid highlight. All layers circulate together along the actual cut. Seven elemental profiles supply separate sprite material, timing and carried details: lightning, magic, water, fire, nature, earth and ice. Tints come from the gem itself; glyphs stay above the effect. There are no UI arrows or detached outline frames.

Six new generated alpha atlases are stored with prompts in `art-source/target-vfx/`; magic reuses the approved study atlas. Runtime WebPs load on demand. Cached geometry and a four-entry tint cache limit repeated work. Only the current target animates; removed targets are released. Full/light render at 30/24 fps, reduced motion keeps a visible static hybrid, and modal/hidden-page states pause it. Missing sprite assets retain core + fluid as a fallback. The preview page remains available, with its independent choice storage unchanged.

Validation: `hybrid-vfx-check.cjs` covers 24 palettes, seven cuts/elements, asset fallback, cache limits, reload, resize, modal pause and reduced motion. Updated `level5-marker-check.cjs` passes at 320/390/476/1440px. Updated `focus-preview-check.cjs` checks live movement, hint, reload and all seven cuts. Updated `fusion-check.cjs` verifies guided/off-target/repeated merges, score and album credit, learning cards and restoration of exactly one hybrid marker after continuing. A full palette contact sheet and mobile screenshots were visually inspected. Desktop browser samples of one marker were roughly 2–4 ms per painted frame; this is not a physical-phone benchmark. Historical SVG-ribbon-only scripts (`rim-motion-check`, `element-focus-check`, browser section of `marker-visibility-check`) describe the superseded renderer; use the hybrid checks for current marker visuals.

### Stable mobile layout during moves

Fixed a horizontal overflow introduced by the expanded target-marker canvas. A level-6 edge target extended document scroll width from 495 to 503px; classic scrollbar appearance then changed the space available to the mobile board fitter. The mobile play root now clips horizontal overflow only at the page edge, preserving visible overflow around the board and vertical scrolling on short screens. The fitter also observes the root's actual size so scrollbar/content-width changes settle immediately rather than on the next move.

`work/mobile-layout-stability-check.cjs` reproduces the original overflow by temporarily restoring the old style, then checks 36 real moves over six viewport/scrollbar configurations: 320×568, 390×844, 495×900 with and without reserved scrollbar space, 810×540 landscape, and 1440×900 desktop. Across more than 1,100 sampled animation frames, board/HUD/button bounds stayed within 0.6px of their starting geometry, with no horizontal overflow. Mobile remains 5×7, desktop 7×5. Inspected the narrow-window screenshot with scrollbar space reserved.

### Continuous centered fusion and learning card

Live matches now open one staged cinematic modal as soon as the matching tiles touch. Two sharp ingredient copies fly above the blurred board to the center of the viewport, with the pair's element and palette. Every element uses the same 2.2-second choreography. At impact, the actual learning-card gem appears at the collision point; it then settles into its reserved position above the information. No temporary board-result gem is created, and the result DOM node is never replaced between fusion and reading. The old composition re-entry animation is disabled for this flow.

The information panel reserves its natural responsive layout while hidden and inert. Its text and Continue button appear after fusion with a short fade; card-reading time starts only then. Reduced motion and background-page matches skip the flight. Pending matches are credited and saved before animation, so reloading opens the learning card directly without crediting the match again. The existing off-target match scoring/album behavior is unchanged.

Validation: updated `work/fusion-check.cjs` covers desktop guided matches, mobile off-target/repeated matches, reduced motion, scoring, album credit, pending reload, same result-node identity and cleanup/next marker. `work/continuous-fusion-check.cjs` checks all seven elements at 320px mobile, 390px mobile, desktop and short landscape: two moving ingredients, viewport-center collision, hidden information before fusion, one persistent result node, enabled Continue afterward, and complete information fitting without panel scrolling. Inspected mobile impact and compact result screenshots.

### Unified cosmic UI shell

The HUD, outer desktop board frame, route map, album, reward shelf, menus, onboarding, settings and learning-card panels now share `ui-shell.css`. The common palette uses deep navy surfaces, muted violet primary actions, warm gold score/hint accents and light readable text. Thin borders replace heavy white frames; hard button shadows and ribbon tails are removed. Keyboard focus remains distinct from hover. Mobile and desktop use the same visual language, while keeping their established responsive grid and safe-area sizing.

The playfield's gem sprites, grid rules, cosmic background and VFX are unchanged. This stylesheet only updates the surrounding shell and information surfaces. `ui-shell-check.cjs` verifies navigation through map, onboarding, play, menu and album at 390/1440px. Inspected those screens plus mobile settings and result cards. `mobile-layout-stability-check.cjs` passes all six viewport/scrollbar configurations and 36 moves. `continuous-fusion-check.cjs` passes all seven elements, persistent result-node identity, deferred information visibility and no-scroll information layout at 320/390/810/1440px. Keyboard Tab focus was checked in settings.

### Chapter journey layout

The map now shows one chapter at a time with five connected milestones on the cosmic background. Chapter arrows replace the stacked chapter cards. Selecting a milestone updates its description and play action without launching or resetting the game. Returning to the map selects the active or recommended chapter; an ongoing game offers Resume. Completed milestones display stars, locked milestones remain disabled, and the fifth milestone uses a rounded diamond silhouette.

Mobile places the chapter heading above the route and the selected level/action beneath it. Desktop places chapter information and the play action beside the route. Album count is a compact shortcut; scope, settings, playtest and sources are in the information menu. Short screens scroll naturally without overlapping the action and bottom navigation. The playfield and saved progress schema are unchanged.

Validation: work/journey-map-check.cjs passes at 320x568, 390x844, 495x900, 810x540 and 1440x900. It checks chapter switching, locked states, selection without starting, unchanged saved state while browsing, menu/about and album navigation, continuation of an existing level-07 board, minimum 44px level/action targets, no horizontal overflow and no page errors. Mobile and desktop screenshots were visually inspected.

### Restore the original bright visual style

Restored the original sky-blue outer UI, clouds, white/cream surfaces, purple accents and lime play action. The chapter route layout remains; its milestones, paths, text and shortcuts now use the bright palette. Removed the dark recoloring rules from ui-shell.css, retaining keyboard-focus/hover refinements only. Existing original styles again control the HUD, album, menus and learning panels. Cosmic gem playfield artwork is unchanged.

Validation: journey-map-check passes all five viewport cases. ui-shell-check passes map, intro, play, menu and album navigation at 390 and 1440px. Visually inspected the bright map on mobile/desktop and the mobile play screen.

### Sky-blue playfield

Replaced the dark space board background with a cyan/sky-blue glass gradient that matches the bright outer UI. Soft mint and blue ambient layers retain slow drift; background sparkles are reduced to 20–24% opacity. Aurora/rose/gold variations use light washes without the old dark cosmos image. The mobile frame now uses a pale blue edge and a light blue shadow. Empty, destination and hint cells have distinct readable treatments on the new background. Gem artwork, marker/fusion effects and board geometry are unchanged; existing reduced-motion and light-quality rules still apply.

Validation: ui-shell-check passes at 390 and 1440px, including board columns, one objective marker and navigation. Inspected mobile and desktop playfield screenshots for color coherence and glyph visibility.

### Crystal lagoon playfield refinement

Deepened the playfield into a blue lagoon with a calm mid-blue center and teal edge lighting. A small authored SVG supplies curved refracted-light detail concentrated near the edges, drifting as one compositor layer rather than competing with gems. Sparse background particles remain subdued. The bright outer UI, gem art and gameplay are unchanged. Light quality and reduced-motion modes stop the new drift.

Validation: ui-shell-check passes mobile 390px and desktop 1440px navigation and board/marker assertions. Visually inspected both playfield screenshots for gem separation and legibility.

### Approved option 1: diffuse underwater light

Applied the selected underwater concept using three soft gradient layers over a petrol-blue field. Broad mint light pools drift continuously on separate 23/28/34-second cycles, leaving a quiet deeper center. Removed runtime star textures, caustic lines and reward-sky color overrides to keep the approved palette consistent. Geometry, gem artwork and gameplay are unchanged. Light quality and reduced motion freeze the ambient layers.

Validation: ui-shell-check passes at 390/1440px; both playfield screenshots inspected. underwater-check verifies transforms advance, backgrounds contain no old texture URLs, and reduced-motion/light-quality modes stop animation. This is a CSS interpretation of the selected concept, not a flattened screenshot asset.

### Underwater effect layers

Added three continuously animated background refractions: soft overlapping light pools, broad blurred ripple highlights and moving rim reflections. Main drift cycles now run 16–22 seconds; secondary refractions use 10–15 seconds. All layers stay behind gems and within the board. Reduced-motion and light-quality modes stop secondary animation as well.

Validation: expanded underwater-check verifies all six base/pseudo-element transforms advance and all stop in reduced-motion/light modes. ui-shell-check passes at mobile 390px and desktop 1440px; inspected mobile screenshot.

### Option 3: continuously flowing light silk

Replaced the underwater layers with one broad teal-to-periwinkle S-shaped ribbon over petrol blue. Its SVG surface, glow and fold share a continuously deforming 16-second path, with a separate 19-second sway. The ribbon stays behind all board interaction and gem effects. Light quality removes the glow/filter cost while retaining slower motion; reduced-motion mode presents a static ribbon. No old underwater/stars layers remain in the board markup.

Validation: ui-shell-check passes mobile/desktop navigation and marker/column assertions. silk-background-check verifies actual path deformation at 390/1440px, unchanged board geometry, no horizontal overflow, continued light-quality motion, and static reduced-motion rendering. Inspected both playfield screenshots. Historical underwater-check applies to the superseded option-1 renderer.

### Soft translucent silk renderer

Replaced the uniformly filled SVG band with a shaded canvas ribbon. Its width has a Gaussian transparency falloff, a luminous folded shoulder and soft feathered edges; both centerline and cross-section deform continuously. A subtle final blur removes strip seams. Color stays teal through periwinkle on the petrol background.

Rendering caps DPR at 1.5, runs at 30fps (20fps with fewer strips in light mode), and pauses when offscreen, hidden, outside play, or under reduced-motion preference. No input is attached to the canvas. Existing gem art and gameplay remain unchanged.

Validation: node syntax check and ui-shell-check pass at 390/1440px. Reworked silk-background-check compares actual canvas pixels for motion, reduced-motion freeze/resume, light mode, and map pause/resume, with stable board bounds and no horizontal overflow/page errors. Inspected mobile and desktop screenshots after softening visible strip seams.

### Aurora and drifting stars replace silk

The playfield now loads aurora-background.js instead of the silk renderer. Two softly shaded teal/periwinkle aurora curtains undulate continuously behind up to 90 small stars with gentle depth-dependent drift and subtle brightness variation. Curtains render into a smaller offscreen canvas with pixel-aligned strips to avoid vertical overlap seams, then upscale smoothly; stars remain sharp. Original bright outer UI and gameplay remain unchanged.

Rendering retains capped DPR, 30/20fps modes, reduced-motion freeze, and hidden/offscreen/non-play pause. Validation: ui-shell-check passes at 390/1440px. aurora-background-check verifies changing canvas pixels, stable geometry, light/reduced-motion behavior, map pause/resume, no horizontal overflow and no page errors. Inspected mobile and desktop output after fixing column seams. Historical silk/underwater checks refer to older renderers.

### Target-row actions replace bottom dock

Removed the Undo button and its click handler. Hint and Menu now sit beside the target bar on mobile and beside the current target on desktop. The bottom action dock is gone; Restart and Help are available through the same Menu on both platforms. The responsive board fitter now reserves the combined target/action row once and uses four portrait rows instead of five. Small phones wrap eight target badges inside a stable 60px row; both action targets remain at least 44px.

Legacy history/undo fields remain in the saved schema for compatibility, with no exposed undo action. Validation: ui-shell-check passes 390/1440px. mobile-layout-stability-check passes 36 moves across six viewport/scrollbar cases, including 320px and landscape. target-toolbar-check passes at 320/390/810/1440px with eight targets fully contained, aligned buttons, working Hint/Menu/Help and no horizontal overflow. Inspected mobile and desktop layouts.

### Compact mobile footer

Portrait play now sizes the game shell to its content rather than vertically centering it inside a forced viewport-height panel. Ordinary feedback uses a 24px row, starts near the board, and retains only 8px bottom safe-area padding. Tutorial/learning-tip rows retain 44px for readable touch controls. Board fitting always budgets the 44px tutorial allowance so hiding a tip does not resize the board. Landscape retains its full-height side-by-side layout.

Validation: mobile-layout-stability-check passes six viewport/scrollbar cases and 36 moves; target-toolbar-check passes all four viewport cases with eight targets. Inspected 495px mobile output. Tall viewports can still have unused page space because the 5x7 board preserves square gems and is constrained by screen width; the game shell itself no longer reserves that space.

### 40-cell boards with three fixed obstacles

All 15 levels now use 5 columns by 8 rows on mobile and 8 columns by 5 rows on desktop. Normal play contains 18 gem pairs, three immovable gray rocks and one empty cell. The layouts transpose exactly when the viewport changes. Rock positions leave the traversable board connected with no articulation cells. Matches briefly leave three empty cells during the learning overlay; refill restores one.

Initial pairs and newly spawned pairs are separated by at least five orthogonal steps along a route avoiding rocks. Movement, hint search, refill sliding, relocation and full rearrangement all exclude obstacle cells. Level introductions and Help explain the rocks. Thirty course routes and star thresholds were regenerated for the new geometry; routes demonstrate solvability and are not optimal-move proofs.

State version 10 validates obstacles explicitly. The bundled legacy v9 engine validates older saves before migration. A migrated active board is rearranged once to fit the new geometry, retaining discovered characters, score, moves, profile progress and any existing star benchmark. Pending learning cards retain their character and receive a new valid refill plan. Normal viewport resizing only transposes the board.

Validation: obstacle-engine-check covers 360 initial boards, 266 legacy state migrations and all 30 complete course routes (1,686 moves, 76 refills). Forced single-relocation and full-rearrangement fallback tests pass in both orientations. Progress-store checks pass; browser checks verify migration, reload, transpose round-trip and 320px onboarding. UI navigation passes at 390/1440px, and layout stability passes all six viewport/scrollbar cases. Mobile and desktop screenshots inspected. Localhost only.

### Return to clear boards without obstacles (2026-11-10)

Following product decision, all fixed obstacles have been removed from the game. The 3 immovable gray rocks previously introduced narrow bottlenecks and high-move permutations that risked frustrating deadlock states for beginners studying Kanji.

- **Geometry**: Restored pure unblocked layouts: mobile 5×7 (34 tiles / 17 pairs, 1 blank), desktop 7×5 (34 tiles / 17 pairs, 1 blank). Both layouts transpose symmetrically on viewport change ($5 \times 7 \leftrightarrow 7 \times 5$).
- **Gameplay flow**: No blocked cells; every cell is reachable and navigable by the blank. 5-step Manhattan distance ensures newly spawned pairs enter far apart without causing deadlocks.
- **State version 11**: Schema v11 automatically migrates legacy v10 boards (40-cell obstacle layouts) and earlier v8/v9 boards to the clean 35-cell board, retaining discovered characters, score, moves, album progress, and sound settings.
- **Course plans**: Restored all 30 pre-verified complete solutions (15 mobile, 15 desktop) in `course-plans.js`, verified 100% solvable.
- **Desktop visual scaling**: Combined with the expanded desktop layout, 7×5 provides generous ~130px–135px tile sizes with clear Kanji glyphs across desktop viewports.

### Audio Engine Overhaul & Sound Profiles (2026-11-10 / 2026-11-11)

Following user feedback on sound feedback feel and tactile immersion:

- **Acoustic Overhaul (`audio-fx.js`)**:
  - Replaced harsh synthesized square/sawtooth clicks with a hybrid physical modeling engine + real recorded Foley audio samples (`audio/tile_slide.mp3`, `audio/gem_clink.ogg`, `audio/go_stone_*.mp3`).
  - Added dedicated bus routing with lowpass filtering: `sfxBus` (5200Hz lowpass) and `bgmBus` (4000Hz lowpass), fed into a smooth dynamic compressor preventing clipping or distortion.
  - Composed a joyful 126 BPM Japanese Puzzle Pop BGM groove using warm FM electric piano, bouncy synth bass, acoustic handclaps, and a sparkling celesta melody.

- **Elimination of Double-Click / Audio Mismatch**:
  - Resolved an issue where tapping a tile produced an unwanted initial tap/click followed by a slide or contact sound.
  - Unified the sliding audio event: standard tile moves trigger a single clean slide sound matching the active profile.
  - Suppressed premature contact/fusion sounds during sliding until the two tiles physically touch and the fusion choreography begins.

- **Five Selectable Sound Profiles**:
  - `tile` (*Mặc định — Lướt gạch êm dịu*): Soft, satisfying slide using `audio/tile_slide.mp3`.
  - `gem` (*Đá quý va chạm trong & sáng*): Resonant crystal clink using `audio/gem_clink.ogg`.
  - `crystal` (*Pha lê thanh thoát*): High-frequency inharmonic crystal resonance.
  - `stone` (*Đá cờ vây mộc mạc*): Authentic Go/Mahjong slate stone clack (`audio/go_stone_*.mp3`).
  - `soft` (*Ngọc bích nhẹ nhàng*): Warm, deep jade stone resonance.
  - Active profile persists under `localStorage['kanji-pop-sound-profile']` with runtime switcher exposed in Settings.

- **Automated Validation**:
  - All test suites (`fusion-check.cjs`, `ui-shell-check.cjs`, `mobile-layout-stability-check.cjs`) pass 100%.
  - Verified across multiple viewports (320px to 1440px) with zero layout regressions and zero audio stutter.
