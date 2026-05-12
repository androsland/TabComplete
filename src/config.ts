import * as vscode from 'vscode';

export interface ExtensionConfig {
  model: string;
  autoTrigger: boolean;
  debounceDelay: number;
  maxPromptTokens: number;
  prefixPercentage: number;
  maxSuffixPercentage: number;
  maxCompletionTokens: number;
  temperature: number;
  useCache: boolean;
  multilineCompletion: boolean;
  minTriggerLength: number;
  modelTimeout: number;
  stopSequences: string[];
  enabledLanguages: string[];
  showLoadingIndicator: boolean;
}

export function getConfig(): ExtensionConfig {
  const cfg = vscode.workspace.getConfiguration('tabComplete');
  return {
    model: cfg.get<string>('model', 'claude-haiku-4-5-20251001'),
    autoTrigger: cfg.get<boolean>('autoTrigger', true),
    debounceDelay: cfg.get<number>('debounceDelay', 350),
    maxPromptTokens: cfg.get<number>('maxPromptTokens', 512),
    prefixPercentage: cfg.get<number>('prefixPercentage', 0.85),
    maxSuffixPercentage: cfg.get<number>('maxSuffixPercentage', 0.2),
    maxCompletionTokens: cfg.get<number>('maxCompletionTokens', 256),
    temperature: cfg.get<number>('temperature', 0),
    useCache: cfg.get<boolean>('useCache', true),
    multilineCompletion: cfg.get<boolean>('multilineCompletion', true),
    minTriggerLength: cfg.get<number>('minTriggerLength', 0),
    modelTimeout: cfg.get<number>('modelTimeout', 10000),
    stopSequences: cfg.get<string[]>('stopSequences', []),
    enabledLanguages: cfg.get<string[]>('enabledLanguages', []),
    showLoadingIndicator: cfg.get<boolean>('showLoadingIndicator', true),
  };
}

export function isLanguageEnabled(languageId: string): boolean {
  const { enabledLanguages } = getConfig();
  if (enabledLanguages.length === 0) return true;
  return enabledLanguages.includes(languageId);
}
