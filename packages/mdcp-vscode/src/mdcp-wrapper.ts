import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  loadConfig,
  compileGuidesFromResults,
  writeCompiledGuidesFromResults,
  genRefsFromCompiled,
  checkOrphansForGuides,
  lintLinks,
  compileGuideResultsWithContext,
  resolveDocsRoot,
  resolveOutputPath,
  resolveRefsPath,
  getGuideConfig,
  resolveGuideDir,
} from '@bwilliamson/mdcp-core';
import { IAssistantProvider, CursorInjector, CopilotInjector, GeminiInjector } from './injectors';

export class MdcpWrapper {
  private outputChannel: vscode.OutputChannel;
  private injectors: IAssistantProvider[];

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('MDCP');
    this.injectors = [new CursorInjector(), new CopilotInjector(), new GeminiInjector()];
  }

  private getWorkspaceRoot(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return undefined;
    }
    return folders[0].uri.fsPath;
  }

  public async initializeWorkspace() {
    const root = this.getWorkspaceRoot();
    if (!root) {
      vscode.window.showErrorMessage('MDCP: Please open a workspace folder first.');
      return;
    }

    const docsDir = path.join(root, 'docs');
    const configPath = path.join(docsDir, 'mdcp.config.json');

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        compileOrder: ['features', 'developer', 'client'],
        guides: [{ name: 'features' }, { name: 'developer' }, { name: 'client' }],
        outputDir: '_build',
        refs: { registryFile: '.caches/refs.json' },
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');

      // Create starter directories
      ['features', 'developer', 'client'].forEach((guide) => {
        const guideDir = path.join(docsDir, guide);
        if (!fs.existsSync(guideDir)) {
          fs.mkdirSync(guideDir, { recursive: true });
          fs.writeFileSync(
            path.join(guideDir, 'index.md'),
            `# ${guide.charAt(0).toUpperCase() + guide.slice(1)}\n\n- [Overview](./overview.md)\n`,
            'utf-8',
          );
          fs.writeFileSync(
            path.join(guideDir, 'overview.md'),
            `# Overview\n\nWelcome to the ${guide} guide.\n`,
            'utf-8',
          );
        }
      });
      this.outputChannel.appendLine(`Initialized MDCP workspace in ${docsDir}`);
      vscode.window.showInformationMessage('MDCP Workspace Initialized!');
    } else {
      vscode.window.showInformationMessage('MDCP config already exists.');
    }

    // Trigger AI Injectors
    await this.injectAiContext(root);

    // Prompt for tooling integration
    const configureTooling = await vscode.window.showInformationMessage(
      'Would you like to configure optional tooling (Markdownlint, Prettier, Vale)?',
      'Yes',
      'No',
    );

    if (configureTooling === 'Yes') {
      await this.configureTooling();
    }
  }

  public async configureTooling() {
    const root = this.getWorkspaceRoot();
    if (!root) return;

    const tools = await vscode.window.showQuickPick(
      [
        {
          label: 'Markdownlint',
          description: 'Scaffold .markdownlint.json using @bwilliamson/mdcp-presets',
          picked: true,
        },
        {
          label: 'Prettier',
          description: 'Scaffold .prettierrc for markdown formatting',
          picked: true,
        },
        { label: 'Vale', description: 'Scaffold .vale.ini for prose linting', picked: true },
      ],
      { canPickMany: true, placeHolder: 'Select tooling to configure' },
    );

    if (!tools || tools.length === 0) return;

    for (const tool of tools) {
      if (tool.label === 'Markdownlint') {
        const mlPath = path.join(root, '.markdownlint.json');
        if (!fs.existsSync(mlPath)) {
          fs.writeFileSync(
            mlPath,
            JSON.stringify(
              {
                extends: './node_modules/@bwilliamson/mdcp-presets/markdownlint/shards.json',
              },
              null,
              2,
            ),
            'utf-8',
          );
          this.outputChannel.appendLine(`Generated ${mlPath}`);
        }
      } else if (tool.label === 'Prettier') {
        const prettierPath = path.join(root, '.prettierrc');
        if (!fs.existsSync(prettierPath)) {
          fs.writeFileSync(
            prettierPath,
            JSON.stringify(
              {
                proseWrap: 'always',
                printWidth: 100,
              },
              null,
              2,
            ),
            'utf-8',
          );
          this.outputChannel.appendLine(`Generated ${prettierPath}`);
        }
      } else if (tool.label === 'Vale') {
        const valePath = path.join(root, '.vale.ini');
        if (!fs.existsSync(valePath)) {
          fs.writeFileSync(
            valePath,
            `StylesPath = styles
MinAlertLevel = suggestion

Packages = Google

[*.md]
BasedOnStyles = Vale, Google
`,
            'utf-8',
          );
          this.outputChannel.appendLine(`Generated ${valePath}`);
        }
      }
    }
    vscode.window.showInformationMessage('MDCP Tooling Configured!');
  }

  private async injectAiContext(root: string) {
    // Run all registered injectors
    for (const injector of this.injectors) {
      try {
        await injector.injectContext(root, this.outputChannel);
      } catch (error: any) {
        this.outputChannel.appendLine(
          `Failed to inject ${injector.name} context: ${error.message}`,
        );
      }
    }

    // Generate llms.txt
    const llmsTxtPath = path.join(root, 'docs', 'llms.txt');
    if (!fs.existsSync(llmsTxtPath)) {
      fs.writeFileSync(
        llmsTxtPath,
        `mdcp-llms-index: 0.4.0.0\n\nThis repository uses MDCP for documentation.\n`,
        'utf-8',
      );
      this.outputChannel.appendLine(`Generated llms.txt at ${llmsTxtPath}`);
    } else {
      this.outputChannel.appendLine(`llms.txt already exists at ${llmsTxtPath}`);
    }
  }

  public async compileGuides() {
    const root = this.getWorkspaceRoot();
    if (!root) return;

    try {
      this.outputChannel.show();
      this.outputChannel.appendLine('Compiling MDCP Guides...');
      vscode.window.setStatusBarMessage('$(sync~spin) MDCP Compiling...', 2000);

      const configPath = path.join(root, 'docs', 'mdcp.config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('mdcp.config.json not found in docs/ directory.');
      }

      const config = loadConfig(configPath, path.join(root, 'docs'));
      const docsRoot = path.join(root, 'docs');

      const compileOpts = {
        guidesRoot: resolveDocsRoot(config, docsRoot),
        compileOrder: config.compileOrder,
        banner: config.banner,
        guides: config.guides,
        docsRoot,
        config,
      };

      const { results } = compileGuideResultsWithContext(compileOpts);
      const monolithPath = resolveOutputPath(config, docsRoot);
      writeCompiledGuidesFromResults(results, compileOpts, monolithPath);

      const compiledText = compileGuidesFromResults(results, compileOpts);
      const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs?.registryFile);
      genRefsFromCompiled(compiledText, refsPath);

      this.outputChannel.appendLine('Compile completed successfully.');
      vscode.window.showInformationMessage('MDCP: Compile Successful');
    } catch (error: any) {
      this.outputChannel.appendLine(`Error compiling guides: ${error.message}`);
      vscode.window.showErrorMessage(`MDCP Compile Error: ${error.message}`);
    }
  }

  public async checkLinks() {
    const root = this.getWorkspaceRoot();
    if (!root) return;

    try {
      this.outputChannel.show();
      this.outputChannel.appendLine('Checking MDCP Links...');

      const configPath = path.join(root, 'docs', 'mdcp.config.json');
      const config = loadConfig(configPath, path.join(root, 'docs'));
      const docsRoot = path.join(root, 'docs');

      const compileOpts = {
        guidesRoot: resolveDocsRoot(config, docsRoot),
        compileOrder: config.compileOrder,
        banner: config.banner,
        guides: config.guides,
        docsRoot,
        config,
      };

      const { results, linkIndex, shardCache } = compileGuideResultsWithContext(compileOpts);
      const compiledText = compileGuidesFromResults(results, compileOpts);
      const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs?.registryFile);
      genRefsFromCompiled(compiledText, refsPath);

      const guideEntries = config.compileOrder.map((name: string) => {
        const cfg = getGuideConfig(config, name);
        return {
          name,
          dir: resolveGuideDir(name, config, docsRoot),
          manifest: cfg?.compile?.manifest,
          sectionsHeading: cfg?.compile?.sectionsHeading,
          scopeRoot: cfg?.compile?.scopeRoot
            ? path.resolve(docsRoot, cfg.compile.scopeRoot)
            : undefined,
        };
      });

      const orphans = checkOrphansForGuides(guideEntries);
      if (orphans.length > 0) {
        this.outputChannel.appendLine(`Found ${orphans.length} orphaned files.`);
      }

      const linkIssues = lintLinks({
        config,
        docsRoot,
        results,
        compileOptions: compileOpts,
        linkIndex,
        shardCache,
      });
      if (linkIssues.length > 0) {
        this.outputChannel.appendLine(`Found ${linkIssues.length} broken links.`);
        linkIssues.forEach((issue: any) =>
          this.outputChannel.appendLine(`- ${issue.file}: ${issue.message}`),
        );
      } else {
        this.outputChannel.appendLine('All links are valid.');
      }

      vscode.window.showInformationMessage('MDCP: Check Completed (see output)');
    } catch (error: any) {
      this.outputChannel.appendLine(`Error checking links: ${error.message}`);
      vscode.window.showErrorMessage(`MDCP Check Error: ${error.message}`);
    }
  }
}
