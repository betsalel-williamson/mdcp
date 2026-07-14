import re

with open('.github/workflows/ci.yml', 'r') as f:
    content = f.read()

# Add compilation and git diff check
content = re.sub(
    r'- run: pnpm run docs:check\n',
    r'- run: pnpm run docs:check\n      - run: pnpm run docs:compile\n      - name: Ensure documentation outputs are up-to-date\n        run: git diff --exit-code docs/ _build/ README.md DEVELOPERS.md packages/mdcp-cli/README.md packages/mdcp-core/README.md examples/sample-guides/\n',
    content
)

with open('.github/workflows/ci.yml', 'w') as f:
    f.write(content)
