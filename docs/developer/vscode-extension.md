# VS Code Extension Development

The MDCP VS Code extension (`packages/mdcp-vscode`) is the primary delivery mechanism for the MDCP AI Skill. It bundles the CLI and core libraries to provide a zero-friction experience for users.

## Local Setup & Building

The extension is written in TypeScript and uses `esbuild` for fast bundling. It relies on the `@bwilliamson/mdcp-cli` and `@bwilliamson/mdcp-core` packages from the monorepo.

1. **Install dependencies**: Run `pnpm install` from the repository root.
2. **Build the extension**:
   ```bash
   pnpm --filter mdcp-vscode build
   ```
   This compiles `src/extension.ts` and bundles all dependencies into `dist/extension.js`.

## Testing Locally (Dog-fooding)

To test the extension locally in your own IDE (Cursor/VS Code):

### Method 1: Using the Debugger
1. Open the `packages/mdcp-vscode` folder in VS Code or Cursor.
2. Press `F5` to launch the Extension Development Host.
3. In the new window, open a workspace and test the `MDCP: Initialize Workspace` and `MDCP: Compile Guides` commands.

### Method 2: Sideloading the `.vsix`
You can package the extension into a `.vsix` file and install it directly into your primary IDE environment.

1. **Package the extension**:
   ```bash
   cd packages/mdcp-vscode
   npx @vscode/vsce package --no-dependencies
   ```
   This will generate a file like `mdcp-vscode-0.1.0.vsix`. (We use `--no-dependencies` because the extension is bundled with `esbuild` and doesn't need `node_modules` included in the VSIX).

2. **Install the extension**:
   - **Via CLI**: `code --install-extension mdcp-vscode-0.1.0.vsix` (or `cursor --install-extension mdcp-vscode-0.1.0.vsix`)
   - **Via UI**: Open the Extensions view, click the `...` menu at the top right, and select **Install from VSIX...**.

## Publishing

The extension is published to both the **Visual Studio Marketplace** and the **Open VSX Registry** to ensure compatibility across all VS Code-based IDEs (Cursor, GitHub Copilot IDE, Windsurf, VSCodium, etc.).

Publishing is fully automated via GitHub Actions (`.github/workflows/publish-vscode-extension.yml`).

### How to Release

1. Update the version in `packages/mdcp-vscode/package.json`.
2. Commit the version bump.
3. Tag the commit with the prefix `vscode-v` (e.g., `vscode-v0.1.0`).
4. Push the tag to GitHub:
   ```bash
   git tag vscode-v0.1.0
   git push origin vscode-v0.1.0
   ```
5. The GitHub Action will automatically build the extension and publish it to both registries using the configured `VSCE_PAT` and `OVSX_PAT` secrets.
