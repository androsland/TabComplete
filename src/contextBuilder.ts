import * as vscode from 'vscode';
import { ExtensionConfig } from './config';

export interface CompletionContext {
  prefix: string;
  suffix: string;
  languageId: string;
  filename: string;
}

// Rough character-to-token ratio (conservative estimate: 3 chars per token)
const CHARS_PER_TOKEN = 3;

export function buildContext(
  document: vscode.TextDocument,
  position: vscode.Position,
  config: ExtensionConfig
): CompletionContext {
  const totalChars = config.maxPromptTokens * CHARS_PER_TOKEN;
  const prefixChars = Math.floor(totalChars * config.prefixPercentage);
  const suffixChars = Math.floor(totalChars * config.maxSuffixPercentage);

  const fullPrefix = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );
  const fullSuffix = document.getText(
    new vscode.Range(position, document.positionAt(document.getText().length))
  );

  const prefix = fullPrefix.length > prefixChars
    ? fullPrefix.slice(fullPrefix.length - prefixChars)
    : fullPrefix;

  const suffix = fullSuffix.length > suffixChars
    ? fullSuffix.slice(0, suffixChars)
    : fullSuffix;

  return {
    prefix,
    suffix,
    languageId: document.languageId,
    filename: document.fileName.split(/[\\/]/).pop() ?? 'file',
  };
}

export function buildPrompt(ctx: CompletionContext): { system: string; user: string } {
  const system = [
    `You are an expert code completion assistant.`,
    `Language: ${ctx.languageId}`,
    `File: ${ctx.filename}`,
    `Rules:`,
    `- Output ONLY the completion text, nothing else.`,
    `- Do not repeat code that already exists.`,
    `- Do not add explanations, comments about what you're doing, or markdown.`,
    `- Complete naturally from the exact cursor position.`,
    `- If the line is already complete, start a new relevant line.`,
  ].join('\n');

  const user = ctx.suffix.trim()
    ? `<prefix>${ctx.prefix}</prefix>\n<suffix>${ctx.suffix}</suffix>\n\nComplete the code at the cursor (between prefix and suffix). Output only the inserted text.`
    : `${ctx.prefix}`;

  return { system, user };
}
