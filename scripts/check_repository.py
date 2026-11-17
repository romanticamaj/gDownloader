"""Check local documentation links and the shared agent-harness entrypoint."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


def main():
    root = Path(__file__).resolve().parents[1]
    errors = []
    skip = {'.git', 'node_modules', '.output', '.wxt', 'dist', 'coverage'}
    for path in root.rglob('*.md'):
        if skip.intersection(path.relative_to(root).parts):
            continue
        for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
            target = target.strip().strip('<>')
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            destination = path.parent / unquote(parsed.path)
            if not destination.exists():
                errors.append(f'{path.relative_to(root)}: missing link target {target}')
    shared = root / 'AGENTS.md'
    entry = root / 'CLAUDE.md'
    if not shared.is_file() or not shared.read_text(encoding='utf-8').strip():
        errors.append('AGENTS.md must contain the shared project guidance')
    if not entry.is_file() or entry.read_text(encoding='utf-8').strip() != '@AGENTS.md':
        errors.append('CLAUDE.md must import the shared harness with @AGENTS.md')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print('Repository documentation links and agent harness: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
