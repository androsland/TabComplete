import { ExtensionConfig } from './config';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  stop_reason: string;
}

export async function fetchCompletion(
  config: ExtensionConfig,
  apiKey: string,
  system: string,
  userMessage: string,
  signal: AbortSignal
): Promise<string> {
  const stopSequences = config.stopSequences.filter(s => s.trim().length > 0);

  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxCompletionTokens,
      temperature: config.temperature,
      system,
      stop_sequences: stopSequences,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error?.error?.message ?? `HTTP ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();
  const block = data.content[0];
  if (!block || block.type !== 'text') return '';
  const text = block.text;
  if (!config.multilineCompletion) {
    const newline = text.indexOf('\n');
    return newline === -1 ? text : text.slice(0, newline);
  }
  return text;
}
