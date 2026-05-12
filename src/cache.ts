const MAX_ENTRIES = 200;

export class CompletionCache {
  private map = new Map<string, string>();
  private keys: string[] = [];

  get(key: string): string | undefined {
    return this.map.get(key);
  }

  set(key: string, value: string): void {
    if (this.map.has(key)) return;
    if (this.keys.length >= MAX_ENTRIES) {
      const oldest = this.keys.shift()!;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
    this.keys.push(key);
  }

  clear(): void {
    this.map.clear();
    this.keys = [];
  }

  get size(): number {
    return this.map.size;
  }

  static buildKey(prefix: string, suffix: string, model: string): string {
    return `${model}::${prefix}::${suffix}`;
  }
}
