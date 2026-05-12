# TabComplete — VSCode Extension

## Project Overview

**TabComplete** is a VSCode extension that provides AI-powered inline code completions (ghost text) using the Anthropic API. Completions appear at the cursor as dimmed text and are accepted with Tab.

## Architecture

```
src/
  extension.ts          — Activation entry point; registers commands and provider
  completionProvider.ts — InlineCompletionItemProvider; debounce, cache lookup, API call
  anthropicClient.ts    — Thin Anthropic SDK wrapper; client singleton keyed on API key
  contextBuilder.ts     — Extracts prefix/suffix from document; builds system+user prompt
  cache.ts              — LRU-style Map cache (max 200 entries) keyed on model+prefix+suffix
  config.ts             — Typed getConfig() helper; isLanguageEnabled() utility
  statusBar.ts          — Right-side status bar item; shows sparkle/slash/spinner; click toggles auto-trigger
```

## Key Design Decisions

- **InlineCompletionItemProvider** registered for `{ pattern: '**' }` (all files). Language filtering is done inside the provider using `enabledLanguages` config.
- **Debounce** is applied only on automatic triggers; manual triggers (keybinding) bypass it entirely.
- **AbortController** cancels in-flight fetch when VSCode cancels the completion token or a new request starts.
- **Cache key** = `model::prefix::suffix`. Cache is per-session (in-memory only).
- **FIM workaround**: Anthropic has no native fill-in-the-middle API, so prefix+suffix are provided in a structured user message.
- **Token budget**: `maxPromptTokens` is estimated at ~3 chars/token. `prefixPercentage` and `maxSuffixPercentage` split the budget between before/after cursor.

## Commands

| Command | Default Keybinding | Description |
|---|---|---|
| `tabComplete.triggerSuggestion` | `Alt+\` | Manually trigger inline suggestion |
| `tabComplete.toggleAutoTrigger` | (status bar click) | Toggle auto-trigger on/off |
| `tabComplete.clearCache` | — | Clear the in-memory completion cache |

## All Configuration Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `tabComplete.apiKey` | string | `""` | Anthropic API key |
| `tabComplete.model` | enum | `claude-haiku-4-5-20251001` | Model to use |
| `tabComplete.autoTrigger` | boolean | `true` | Auto-trigger while typing |
| `tabComplete.debounceDelay` | number (ms) | `350` | Wait after keystroke before triggering |
| `tabComplete.maxPromptTokens` | number | `512` | Token budget for prefix+suffix context |
| `tabComplete.prefixPercentage` | number 0–1 | `0.85` | Fraction of token budget for prefix |
| `tabComplete.maxSuffixPercentage` | number 0–0.5 | `0.2` | Max fraction of token budget for suffix |
| `tabComplete.maxCompletionTokens` | number | `256` | Max tokens to generate |
| `tabComplete.temperature` | number 0–1 | `0` | Sampling temperature |
| `tabComplete.useCache` | boolean | `true` | Cache completions to avoid duplicate calls |
| `tabComplete.multilineCompletion` | boolean | `true` | Allow multi-line completions |
| `tabComplete.minTriggerLength` | number | `3` | Min chars on line before auto-triggering |
| `tabComplete.modelTimeout` | number (ms) | `10000` | Abort request after this many ms |
| `tabComplete.stopSequences` | string[] | `["\n\n"]` | Sequences that stop generation |
| `tabComplete.enabledLanguages` | string[] | `[]` | Language IDs to enable (empty = all) |
| `tabComplete.showLoadingIndicator` | boolean | `true` | Spinner in status bar during fetch |

## Dev Workflow

```bash
npm install          # install dependencies
npm run compile      # one-shot TypeScript compile
npm run watch        # watch mode

# Press F5 in VSCode to launch Extension Development Host
# Or: vsce package  to build a .vsix for local install
```

## Dependencies

- `@anthropic-ai/sdk` — official Anthropic TypeScript SDK
- `@types/vscode ^1.85` — VSCode extension API types
- `typescript ^5.3` — compiler

## Extending / TODOs

- [ ] Streaming completions (show text as it arrives using `TextDecoder` + `InlineCompletionItem` replacement)
- [ ] Per-language stop sequences (auto-detect from `languageId`)
- [ ] Telemetry / accept-rate tracking
- [ ] Workspace-level API key storage via `SecretStorage` instead of plain settings
- [ ] `.vsix` publish pipeline
