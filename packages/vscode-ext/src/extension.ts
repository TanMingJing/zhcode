import * as vscode from 'vscode';

export function activate(_context: vscode.ExtensionContext): void {
  console.log('WenCode extension activated!');
}

export function deactivate(): void {
  console.log('WenCode extension deactivated!');
}
