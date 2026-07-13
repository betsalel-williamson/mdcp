# VS Code Extension

The MDCP VS Code extension delivers the MDCP AI Skill with zero friction. It bundles the CLI to eliminate NPM dependency overhead, automatically configures AI assistants, and provides opt-in integrations for Prettier, Markdownlint, and Vale.

## Core Capabilities

- **Bundled Execution**: Runs `mdcp compile` and `mdcp check` using the bundled `@bwilliamson/mdcp-core` API. No local `package.json` or Node.js environment is required.
- **1-Click Initialization**: The `MDCP: Initialize Workspace` command scaffolds the `docs/` folder structure, `mdcp.config.json`, and starter shards.
- **AI Context Injection**: Automatically generates system prompts so AI agents proactively use MDCP. Currently supports Cursor (`.cursor/rules/mdcp.mdc`), GitHub Copilot (`.github/copilot-instructions.md`), and Gemini Code Assist (`GEMINI.md`).
- **Tooling Integrations**: Prompts users to configure Markdownlint, Prettier, and Vale during initialization.
- **Editor UI**: Provides Command Palette entries for all major MDCP commands and a Status Bar item for quick access to compilation.

## Architecture

The extension is built using the standard VS Code Extension API and bundled with `esbuild`. It uses a strategy pattern (`IAssistantProvider`) for AI assistant context injection, ensuring cross-LLM compatibility without breaking the core system.

## Usage

1. Install the extension from the VS Code Marketplace or Open VSX Registry.
2. Open a workspace and run `MDCP: Initialize Workspace` from the Command Palette.
3. Edit shards in `docs/features/`, `docs/developer/`, or `docs/client/`.
4. Click the `MDCP` Status Bar item or run `MDCP: Compile Guides` to generate the monoliths.
