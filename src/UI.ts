export class UI {
  static readonly WIDTH = 50;

  static clear(): void {
    console.clear();
  }

  /** Banner principal com bordas duplas */
  static header(title: string, subtitle?: string): void {
    const border = "═".repeat(UI.WIDTH);
    console.log(`\n╔${border}╗`);
    console.log(`║${UI.pad(title, UI.WIDTH)}║`);
    if (subtitle) {
      console.log(`║${UI.pad(subtitle, UI.WIDTH)}║`);
    }
    console.log(`╚${border}╝`);
  }

  /** Linha divisória horizontal com título opcional */
  static separator(label?: string): void {
    if (label) {
      const sides = UI.WIDTH - label.length - 2;
      const left = Math.floor(sides / 2);
      const right = Math.ceil(sides / 2);
      console.log(`\n${"─".repeat(Math.max(0, left))} ${label} ${"─".repeat(Math.max(0, right))}`);
    } else {
      console.log(`${"─".repeat(UI.WIDTH + 2)}`);
    }
  }

  /** Barra de progresso visual — retorna string para ser impressa */
  static bar(current: number, max: number, emoji: string, label: string, barLength = 18): string {
    const ratio = Math.max(0, Math.min(1, current / max));
    const filled = Math.round(ratio * barLength);
    const empty = barLength - filled;
    const blocks = "█".repeat(filled) + "░".repeat(empty);
    return `  ${emoji} ${label.padEnd(3)}[${blocks}] ${current}/${max}`;
  }

  /** Caixa destacada para eventos importantes (level up, vitória, derrota, etc.) */
  static box(lines: string[]): void {
    const maxLen = Math.max(...lines.map((l) => l.length), 28);
    const w = Math.min(maxLen + 2, UI.WIDTH);
    const border = "═".repeat(w);
    console.log(`\n  ╔${border}╗`);
    for (const line of lines) {
      console.log(`  ║ ${line.padEnd(w - 1)}║`);
    }
    console.log(`  ╚${border}╝`);
  }

  // ── Mensagens por tipo ────────────────────────────────────

  static success(msg: string): void {
    console.log(`\n  ✅ ${msg}`);
  }

  static warning(msg: string): void {
    console.log(`\n  ⚠️  ${msg}`);
  }

  static info(msg: string): void {
    console.log(`  ℹ️  ${msg}`);
  }

  static error(msg: string): void {
    console.log(`\n  ❌ ${msg}`);
  }

  // ── Logs de combate ───────────────────────────────────────

  /** Ação ofensiva do jogador (prefixo ▶) */
  static playerAction(msg: string): void {
    console.log(`\n  ▶  ${msg}`);
  }

  /** Ação ofensiva do inimigo (prefixo ◀) */
  static enemyAction(msg: string): void {
    console.log(`\n  ◀  ${msg}`);
  }

  /** Resultado de dano recebido */
  static damage(msg: string): void {
    console.log(`     💥 ${msg}`);
  }

  /** Resultado de cura */
  static heal(msg: string): void {
    console.log(`     💚 ${msg}`);
  }

  // ── Utilitário interno ────────────────────────────────────

  /** Centraliza texto numa largura fixa preenchendo com espaços */
  private static pad(text: string, width: number): string {
    const spaces = width - text.length;
    const left = Math.floor(spaces / 2);
    const right = Math.ceil(spaces / 2);
    return " ".repeat(Math.max(0, left)) + text + " ".repeat(Math.max(0, right));
  }
}
