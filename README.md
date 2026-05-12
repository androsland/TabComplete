# TabComplete — AI Inline Suggestions

AI-powered inline code completions for VS Code, driven by your own [Anthropic API key](https://console.anthropic.com). Suggestions appear as ghost text at your cursor and are accepted with **Tab**.

---

## Features

- **Ghost text completions** — suggestions render inline as dimmed text, exactly like GitHub Copilot
- **Tab to accept** — press Tab to insert the full completion
- **Manual trigger** — press `Ctrl+Alt+Space` (or `Cmd+Alt+Space` on Mac) to request a suggestion on demand
- **Auto-trigger** — suggestions fire automatically as you type, with a configurable debounce delay
- **Toggle auto-trigger** — click the status bar item or run the toggle command to switch auto-trigger on/off without touching settings
- **Works in every language** — registered for all file types; optionally restrict to specific languages
- **Fill-in-the-middle context** — sends both the code before and after your cursor so completions fit naturally
- **Completion cache** — identical context reuses the previous result without an extra API call
- **Secure API key storage** — key is stored in the OS keychain (Windows Credential Manager / macOS Keychain / Linux libsecret), never in plain-text settings
- **Fully configurable** — token budgets, debounce, temperature, stop sequences, timeouts, and more

---

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Open the Command Palette (`Ctrl+Shift+P`) and run **TabComplete: Set API Key**
3. Paste your Anthropic API key (`sk-ant-...`)
4. Start coding — suggestions will appear automatically, or press `Ctrl+Alt+Space` to trigger one manually

---

## Commands

| Command | Default Keybinding | Description |
|---|---|---|
| **TabComplete: Set API Key** | — | Store your Anthropic API key securely in the OS keychain |
| **TabComplete: Trigger Inline Suggestion** | `Alt+\` | Manually request a suggestion at the cursor |
| **TabComplete: Toggle Auto-Trigger** | Status bar click | Enable or disable automatic suggestions while typing |
| **TabComplete: Clear Completion Cache** | — | Flush the in-memory completion cache |

You can rebind the trigger keybinding at any time via **File → Preferences → Keyboard Shortcuts**.

---

## Status Bar

A **TabComplete** item appears in the bottom-right status bar:

| Icon | Meaning |
|---|---|
| `✦ TabComplete` | Auto-trigger is **on** |
| `⊘ TabComplete` | Auto-trigger is **off** |
| `⟳ TabComplete` | A completion is being fetched |

Click it to toggle auto-trigger on/off.

---

## Configuration

All settings are under the `tabComplete.*` namespace. Open **Settings** (`Ctrl+,`) and search for `TabComplete`.

| Setting | Type | Default | Description |
|---|---|---|---|
| `tabComplete.model` | `string` | `claude-haiku-4-5-20251001` | Claude model to use. Haiku is fastest and cheapest; Sonnet and Opus offer higher quality at greater cost. |
| `tabComplete.autoTrigger` | `boolean` | `true` | Automatically trigger suggestions while typing. Disable to use manual-only mode. |
| `tabComplete.debounceDelay` | `number` (ms) | `350` | How long to wait after the last keystroke before firing a suggestion. Increase to reduce API calls; decrease for faster response. |
| `tabComplete.maxPromptTokens` | `number` | `512` | Total token budget for the context sent to the model (prefix + suffix combined). Higher values give the model more code to reason about but increase latency and cost. |
| `tabComplete.prefixPercentage` | `number` (0–1) | `0.85` | Fraction of `maxPromptTokens` allocated to the code **before** the cursor. The remaining budget goes to the suffix. |
| `tabComplete.maxSuffixPercentage` | `number` (0–0.5) | `0.2` | Maximum fraction of `maxPromptTokens` allocated to the code **after** the cursor. |
| `tabComplete.maxCompletionTokens` | `number` | `256` | Maximum number of tokens the model can generate per completion. Lower values keep suggestions short and fast. |
| `tabComplete.temperature` | `number` (0–1) | `0` | Sampling temperature. `0` = fully deterministic. Higher values produce more varied suggestions. |
| `tabComplete.useCache` | `boolean` | `true` | Cache completions so that identical context reuses the previous result without an extra API call. Cleared on restart or via the Clear Cache command. |
| `tabComplete.multilineCompletion` | `boolean` | `true` | Allow completions that span multiple lines. When `false`, the model stops at the first newline, producing single-line suggestions only. |
| `tabComplete.minTriggerLength` | `number` | `0` | Minimum number of characters on the current line before auto-trigger fires. `0` triggers on empty lines too. Increase to suppress suggestions until you've started typing. |
| `tabComplete.modelTimeout` | `number` (ms) | `10000` | Abort a completion request after this many milliseconds if no response has arrived. |
| `tabComplete.stopSequences` | `string[]` | `["\n\n"]` | Strings that cause the model to stop generating. Add language-specific sequences (e.g. `"\nfunction "`) to prevent completions from running into the next declaration. |
| `tabComplete.enabledLanguages` | `string[]` | `[]` | Language IDs to enable completions for. An empty array enables completions in **all** file types. Example: `["typescript", "python", "go"]`. |
| `tabComplete.showLoadingIndicator` | `boolean` | `true` | Show a loading spinner in the status bar while a completion is being fetched. |

---

## Models

| Model | Speed | Cost | Best for |
|---|---|---|---|
| `claude-haiku-4-5-20251001` | ⚡ Fastest | $ Lowest | Default — ideal for real-time inline suggestions |
| `claude-sonnet-4-6` | ◑ Balanced | $$ Medium | Better completions when latency is acceptable |
| `claude-opus-4-7` | ◔ Slowest | $$$ Highest | Highest quality for complex completions |

---

## Tips

**Reduce API usage** — increase `debounceDelay` to `500`+, enable `useCache`, or set `autoTrigger` to `false` and use the manual keybinding.

**Faster suggestions** — lower `maxPromptTokens` to `256` and `maxCompletionTokens` to `128`.

**Single-line only** — set `multilineCompletion` to `false` for quick one-liner suggestions.

**Language-specific stop sequences** — add sequences like `"\nclass "` or `"\ndef "` to `stopSequences` to prevent completions from spilling into the next function or class.

**Restrict to certain languages** — set `enabledLanguages` to e.g. `["typescript", "python"]` to avoid triggering in markdown or JSON files.

---

## Privacy & Security

- Your API key is stored in the **OS keychain** via VS Code's `SecretStorage` API — it is never written to `settings.json` or any plain-text file.
- Code context is sent to Anthropic's API for completion. Review [Anthropic's privacy policy](https://www.anthropic.com/privacy) for details on data handling.
- No telemetry is collected by this extension.

---

## Requirements

- VS Code `1.85.0` or later
- An [Anthropic API key](https://console.anthropic.com)

---

## License

MIT
