import Anthropic from '@anthropic-ai/sdk';
import { ExtensionConfig } from './config';

let client: Anthropic | null = null;
let lastApiKey = '';

export function getClient(apiKey: string): Anthropic {
  if (!client || apiKey !== lastApiKey) {
    client = new Anthropic({ apiKey });
    lastApiKey = apiKey;
  }
  return client;
}

export async function fetchCompletion(
  config: ExtensionConfig,
  apiKey: string,
  system: string,
  userMessage: string,
  signal: AbortSignal
): Promise<string> {
  const anthropic = getClient(apiKey);

  const stopSequences = config.multilineCompletion
    ? config.stopSequences
    : ['\n', ...config.stopSequences];

  const timeoutId = setTimeout(() => {
    // AbortSignal is controlled by the caller; timeout triggers abort externally
  }, config.modelTimeout);

  try {
    const response = await anthropic.messages.create(
      {
        model: config.model,
        max_tokens: config.maxCompletionTokens,
        temperature: config.temperature,
        system,
        stop_sequences: stopSequences,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal }
    );

    const block = response.content[0];
    if (block.type !== 'text') return '';
    return block.text;
  } finally {
    clearTimeout(timeoutId);
  }
}
