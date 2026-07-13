import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

export interface IAssistantProvider {
  name: string;
  injectContext(workspaceRoot: string, outputChannel: vscode.OutputChannel): Promise<void>;
}

export class CursorInjector implements IAssistantProvider {
  name = 'Cursor';

  async injectContext(workspaceRoot: string, outputChannel: vscode.OutputChannel): Promise<void> {
    const cursorRulesDir = path.join(workspaceRoot, '.cursor', 'rules');
    if (!fs.existsSync(cursorRulesDir)) {
      fs.mkdirSync(cursorRulesDir, { recursive: true });
    }

    const mdcpRulePath = path.join(cursorRulesDir, 'mdcp.mdc');
    if (!fs.existsSync(mdcpRulePath)) {
      const ruleContent = `---
description: MDCP Documentation Skill
globs: docs/**/*.md
alwaysApply: false
---

# MDCP Documentation Skill

You are equipped with the MDCP (MarkDown Context Protocol) skill. 
When writing documentation, always use the MDCP VS Code extension commands or the bundled CLI to compile and check your work.

1. Edit shards in \`docs/features/\`, \`docs/developer/\`, or \`docs/client/\`.
2. Run \`MDCP: Compile Guides\` from the command palette to generate the monoliths.
3. Run \`MDCP: Check Links\` to ensure no broken links or missing refs.
4. Do NOT manually edit files in \`docs/_build/\`.
`;
      fs.writeFileSync(mdcpRulePath, ruleContent, 'utf-8');
      outputChannel.appendLine(`Injected Cursor rules at ${mdcpRulePath}`);
    } else {
      outputChannel.appendLine(`Cursor rules already exist at ${mdcpRulePath}`);
    }
  }
}

export class CopilotInjector implements IAssistantProvider {
  name = 'GitHub Copilot';

  async injectContext(workspaceRoot: string, outputChannel: vscode.OutputChannel): Promise<void> {
    const githubDir = path.join(workspaceRoot, '.github');
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }

    const copilotInstructionsPath = path.join(githubDir, 'copilot-instructions.md');
    if (!fs.existsSync(copilotInstructionsPath)) {
      const ruleContent = `# MDCP Documentation Skill

You are equipped with the MDCP (MarkDown Context Protocol) skill. 
When writing documentation, always use the MDCP VS Code extension commands or the bundled CLI to compile and check your work.

1. Edit shards in \`docs/features/\`, \`docs/developer/\`, or \`docs/client/\`.
2. Run \`MDCP: Compile Guides\` from the command palette to generate the monoliths.
3. Run \`MDCP: Check Links\` to ensure no broken links or missing refs.
4. Do NOT manually edit files in \`docs/_build/\`.
`;
      fs.writeFileSync(copilotInstructionsPath, ruleContent, 'utf-8');
      outputChannel.appendLine(`Injected Copilot instructions at ${copilotInstructionsPath}`);
    } else {
      outputChannel.appendLine(`Copilot instructions already exist at ${copilotInstructionsPath}`);
    }
  }
}

export class GeminiInjector implements IAssistantProvider {
  name = 'Gemini Code Assist';

  async injectContext(workspaceRoot: string, outputChannel: vscode.OutputChannel): Promise<void> {
    const geminiPath = path.join(workspaceRoot, 'GEMINI.md');
    if (!fs.existsSync(geminiPath)) {
      const ruleContent = `# MDCP Documentation Skill

You are equipped with the MDCP (MarkDown Context Protocol) skill. 
When writing documentation, always use the MDCP VS Code extension commands or the bundled CLI to compile and check your work.

1. Edit shards in \`docs/features/\`, \`docs/developer/\`, or \`docs/client/\`.
2. Run \`MDCP: Compile Guides\` from the command palette to generate the monoliths.
3. Run \`MDCP: Check Links\` to ensure no broken links or missing refs.
4. Do NOT manually edit files in \`docs/_build/\`.
`;
      fs.writeFileSync(geminiPath, ruleContent, 'utf-8');
      outputChannel.appendLine(`Injected Gemini instructions at ${geminiPath}`);
    } else {
      outputChannel.appendLine(`Gemini instructions already exist at ${geminiPath}`);
    }
  }
}
