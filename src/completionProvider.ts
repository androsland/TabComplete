import * as vscode from 'vscode';
import { getConfig, isLanguageEnabled } from './config';
import { buildContext, buildPrompt } from './contextBuilder';
import { fetchCompletion } from './anthropicClient';
import { CompletionCache } from './cache';
import { StatusBarManager } from './statusBar';
import { getApiKey, SECRET_KEY } from './secrets';

export class InlineSuggestionsProvider implements vscode.InlineCompletionItemProvider {
  private cache = new CompletionCache();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingAbort: AbortController | null = null;
  private cachedApiKey: string | null = null;

  constructor(
    private statusBar: StatusBarManager,
    private secrets: vscode.SecretStorage
  ) {
    secrets.onDidChange((e) => {
      if (e.key === SECRET_KEY) this.cachedApiKey = null;
    });
  }

  private async resolveApiKey(): Promise<string> {
    if (this.cachedApiKey === null) {
      this.cachedApiKey = await getApiKey(this.secrets);
    }
    return this.cachedApiKey;
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | null> {
    const config = getConfig();

    const apiKey = await this.resolveApiKey();
    if (!apiKey) return null;
    if (!isLanguageEnabled(document.languageId)) return null;

    const isManual = context.triggerKind === vscode.InlineCompletionTriggerKind.Invoke;

    if (!isManual && !config.autoTrigger) return null;

    const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
    if (!isManual && linePrefix.trim().length < config.minTriggerLength) return null;

    this.pendingAbort?.abort();

    if (token.isCancellationRequested) return null;

    return new Promise((resolve) => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      const delay = isManual ? 0 : config.debounceDelay;

      this.debounceTimer = setTimeout(async () => {
        if (token.isCancellationRequested) {
          resolve(null);
          return;
        }

        const ctx = buildContext(document, position, config);
        const cacheKey = CompletionCache.buildKey(ctx.prefix, ctx.suffix, config.model);

        if (config.useCache) {
          const cached = this.cache.get(cacheKey);
          if (cached !== undefined) {
            resolve(cached ? [this.makeItem(cached, position)] : null);
            return;
          }
        }

        const abort = new AbortController();
        this.pendingAbort = abort;

        token.onCancellationRequested(() => abort.abort());

        const { system, user } = buildPrompt(ctx);

        if (config.showLoadingIndicator) this.statusBar.setLoading(true);

        try {
          const completion = await fetchCompletion(config, apiKey, system, user, abort.signal);
          const text = completion.trimEnd();

          if (config.useCache) this.cache.set(cacheKey, text);

          if (!text || token.isCancellationRequested) {
            resolve(null);
          } else {
            resolve([this.makeItem(text, position)]);
          }
        } catch (err: unknown) {
          if ((err as Error)?.name !== 'AbortError') {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`TabComplete: ${msg}`);
          }
          resolve(null);
        } finally {
          if (config.showLoadingIndicator) this.statusBar.setLoading(false);
        }
      }, delay);
    });
  }

  private makeItem(text: string, position: vscode.Position): vscode.InlineCompletionItem {
    return new vscode.InlineCompletionItem(
      text,
      new vscode.Range(position, position)
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  dispose(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.pendingAbort?.abort();
  }
}
