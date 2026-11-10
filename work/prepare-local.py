from pathlib import Path

source = Path('C:/Users/Admin/.codex/visualizations/2026/10/23/01a168c6-5ab8-7830-981a-6678d1accc06/kanji-pop.html').read_text(encoding='utf-8')
dest = Path('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/kanji-pop-site/dist')
markup = source.split('<script>')[0]
markup = markup.replace('CHẠM MẢNH CÒN THIẾU', '<b id="kp-step">1 · CHỌN MỘT Ô CHỮ</b>')
markup = markup.replace('Một mảnh nhỏ, khám phá mới!', 'Chọn ô chữ bạn muốn hoàn thành.')
markup = markup.replace('Cứ thong thả nhé', '<span id="kp-streak">Không giới hạn thời gian</span>')
markup = markup.replace('<div class="kp-board-tab">HOÀN THÀNH 4 CHỮ</div>', '<div class="kp-board-tab">CHỌN Ô · GHÉP MẢNH</div>')
markup = markup.replace('<section class="kp-mission"', '<section class="kp-mission"')
head = '<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#61ccf5"><title>Kanji Pop! — Chọn ô, ghép mảnh</title></head><body>\n'
(dest / 'index.html').write_text(head + markup + '\n<link rel="stylesheet" href="game.css"><script src="lucide.min.js"></script><script src="game.js"></script></body></html>\n', encoding='utf-8')
