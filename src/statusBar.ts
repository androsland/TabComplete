import * as vscode from 'vscode';

export class StatusBarManager {
  private item: vscode.StatusBarItem;
  private autoTrigger: boolean;
  private loading = false;

  constructor(autoTrigger: boolean) {
    this.autoTrigger = autoTrigger;
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = 'tabComplete.toggleAutoTrigger';
    this.item.tooltip = 'Click to toggle TabComplete auto-suggestions';
    this.render();
    this.item.show();
  }

  setAutoTrigger(enabled: boolean): void {
    this.autoTrigger = enabled;
    this.render();
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
    this.render();
  }

  private render(): void {
    if (this.loading) {
      this.item.text = '$(loading~spin) TabComplete';
      return;
    }
    this.item.text = this.autoTrigger
      ? '$(sparkle) TabComplete'
      : '$(circle-slash) TabComplete';
  }

  dispose(): void {
    this.item.dispose();
  }
}
