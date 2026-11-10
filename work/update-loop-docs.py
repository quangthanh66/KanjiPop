from pathlib import Path
p=Path('work/kanji-pop-site/GAMEPLAY.md');s=p.read_text(encoding='utf-8').replace('Otherwise use an inactive recipe from the full 24-character set, preferring less recent recipes and fewer repeated components.','Otherwise use an inactive recipe from the full 24-character set. The previous four matched recipes are temporarily excluded, preventing an immediate color loop. The refill search also prefers moving at least one spawn position away from the pair just cleared.')
p.write_text(s,encoding='utf-8')
