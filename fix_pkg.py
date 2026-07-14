import json

with open('package.json', 'r') as f:
    pkg = json.load(f)

scripts = pkg['scripts']

scripts['docs:compile:examples'] = 'node packages/mdcp-cli/dist/cli.js compile --config examples/sample-guides/mdcp.config.json --docs-root examples/sample-guides --warn-broken-links && node packages/mdcp-cli/dist/cli.js export --llms-index --config examples/sample-guides/mdcp.config.json --docs-root examples/sample-guides'
scripts['docs:compile'] = 'pnpm run docs:compile:repo && pnpm run docs:compile:examples'

pkg['scripts'] = scripts

with open('package.json', 'w') as f:
    json.dump(pkg, f, indent=2)
    f.write('\n')
