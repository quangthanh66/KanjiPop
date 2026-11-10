from pathlib import Path
p=Path('work/kanji-pop-site/dist/n5-engine.js')
s=p.read_text(encoding='utf-8').replace('return fallback||guidedHint(s,targets);','return guidedHint(s,targets)||fallback;')
p.write_text(s,encoding='utf-8')
