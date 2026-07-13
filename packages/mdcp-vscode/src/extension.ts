import * as vscode from 'vscode';
import { MdcpWrapper } from './mdcp-wrapper';

export function activate(context: vscode.ExtensionContext) {
  console.log('MDCP extension is now active!');

  const wrapper = new MdcpWrapper();

  // Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(book) MDCP';
  statusBarItem.tooltip = 'MDCP: Compile Guides';
  statusBarItem.command = 'mdcp.compileGuides';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const initDisposable = vscode.commands.registerCommand('mdcp.initializeWorkspace', () => {
    wrapper.initializeWorkspace();
  });

  const compileDisposable = vscode.commands.registerCommand('mdcp.compileGuides', () => {
    wrapper.compileGuides();
  });

  const checkDisposable = vscode.commands.registerCommand('mdcp.checkLinks', () => {
    wrapper.checkLinks();
  });

  const lookupDisposable = vscode.commands.registerCommand('mdcp.lookupRefs', () => {
    vscode.window.showInformationMessage('MDCP: Lookup Refs not fully implemented yet.');
  });

  const configureDisposable = vscode.commands.registerCommand('mdcp.configureTooling', () => {
    wrapper.configureTooling();
  });

  context.subscriptions.push(
    initDisposable,
    compileDisposable,
    checkDisposable,
    lookupDisposable,
    configureDisposable,
  );
}

export function deactivate() {}
