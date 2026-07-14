import re

with open('.github/workflows/ci.yml', 'r') as f:
    content = f.read()

content = re.sub(
    r'- name: Ensure documentation outputs are up-to-date\n        run: git diff --exit-code.*?\n',
    r'- name: Ensure documentation outputs are up-to-date\n        run: git diff --exit-code\n',
    content
)

with open('.github/workflows/ci.yml', 'w') as f:
    f.write(content)
