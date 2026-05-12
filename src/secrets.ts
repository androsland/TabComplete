import * as vscode from 'vscode';

const SECRET_KEY = 'tabComplete.apiKey';

export async function getApiKey(secrets: vscode.SecretStorage): Promise<string> {
  return (await secrets.get(SECRET_KEY)) ?? '';
}

export async function storeApiKey(secrets: vscode.SecretStorage, key: string): Promise<void> {
  await secrets.store(SECRET_KEY, key);
}

export { SECRET_KEY };
