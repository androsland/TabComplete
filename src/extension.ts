import * as vscode from 'vscode';
import { InlineSuggestionsProvider } from './completionProvider';
import { StatusBarManager } from './statusBar';
import { getConfig } from './config';
import { getApiKey, storeApiKey } from './secrets';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  await migrateLegacyApiKey(context);

  const apiKey = await getApiKey(context.secrets);
  const config = getConfig();

  if (!apiKey) {
    vscode.window.showWarningMessage(
      'TabComplete: No API key set.',
      'Set API Key'
    ).then((choice) => {
      if (choice === 'Set API Key') {
        vscode.commands.executeCommand('tabComplete.setApiKey');
      }
    });
  }

  const statusBar = new StatusBarManager(config.autoTrigger);
  const provider = new InlineSuggestionsProvider(statusBar, context.secrets);

  const completionDisposable = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    provider
  );

  const triggerCommand = vscode.commands.registerCommand(
    'tabComplete.triggerSuggestion',
    () => {
      vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
    }
  );

  const setApiKeyCommand = vscode.commands.registerCommand(
    'tabComplete.setApiKey',
    async () => {
      const current = await getApiKey(context.secrets);
      const input = await vscode.window.showInputBox({
        title: 'TabComplete: Set Anthropic API Key',
        prompt: 'Enter your Anthropic API key (sk-ant-...)',
        value: current,
        password: true,
        ignoreFocusOut: true,
        validateInput: (v) => v.trim() ? null : 'API key cannot be empty',
      });
      if (input === undefined) return;
      await storeApiKey(context.secrets, input.trim());
      vscode.window.showInformationMessage('TabComplete: API key saved securely.');
    }
  );

  const toggleCommand = vscode.commands.registerCommand(
    'tabComplete.toggleAutoTrigger',
    async () => {
      const current = getConfig().autoTrigger;
      await vscode.workspace
        .getConfiguration('tabComplete')
        .update('autoTrigger', !current, vscode.ConfigurationTarget.Global);
      statusBar.setAutoTrigger(!current);
      vscode.window.showInformationMessage(
        `TabComplete: Auto-trigger ${!current ? 'enabled' : 'disabled'}`
      );
    }
  );

  const clearCacheCommand = vscode.commands.registerCommand(
    'tabComplete.clearCache',
    () => {
      provider.clearCache();
      vscode.window.showInformationMessage('TabComplete: Completion cache cleared.');
    }
  );

  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('tabComplete.autoTrigger')) {
      statusBar.setAutoTrigger(getConfig().autoTrigger);
    }
  });

  context.subscriptions.push(
    completionDisposable,
    triggerCommand,
    setApiKeyCommand,
    toggleCommand,
    clearCacheCommand,
    configWatcher,
    statusBar,
    { dispose: () => provider.dispose() }
  );
}

// One-time migration: if the user had an API key in plain settings, move it to SecretStorage.
async function migrateLegacyApiKey(context: vscode.ExtensionContext): Promise<void> {
  const cfg = vscode.workspace.getConfiguration('tabComplete');
  const legacyKey = cfg.get<string>('apiKey', '');
  if (!legacyKey) return;

  await storeApiKey(context.secrets, legacyKey);
  await cfg.update('apiKey', undefined, vscode.ConfigurationTarget.Global);
}

export function deactivate(): void {}
