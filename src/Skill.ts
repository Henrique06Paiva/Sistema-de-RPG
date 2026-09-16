import { UI } from "./UI.js";

export class Skill {
  public readonly name: string;
  public level: number;
  public manaCost: number;
  public damageMultiplier: number;
  public upgradeCost: number;

  // Sistema de Maestria por Uso
  public mastery: number;
  public masteryToNextLevel: number;

  constructor(
    name: string,
    manaCost: number,
    damageMultiplier: number,
    upgradeCost: number = 50,
    level: number = 1,
    mastery: number = 0,
    masteryToNextLevel: number = 3
  ) {
    this.name = name;
    this.level = level;
    this.manaCost = manaCost;
    this.damageMultiplier = damageMultiplier;
    this.upgradeCost = upgradeCost;
    this.mastery = mastery;
    this.masteryToNextLevel = masteryToNextLevel;
  }

  // Registra o uso da habilidade durante a batalha
  public recordUsage(): void {
    this.mastery++;
    UI.info(`Maestria em [${this.name}]: ${this.mastery}/${this.masteryToNextLevel} usos para o próximo nível.`);
    if (this.mastery >= this.masteryToNextLevel) {
      UI.success(`Você aperfeiçoou [${this.name}] com a prática!`);
      this.levelUp();
    }
  }

  // Treinar pagando o mestre de habilidades
  public trainWithMaster(): void {
    UI.success(`Treino com o Mestre concluído! [${this.name}] aprimorada!`);
    this.levelUp();
  }

  // Regra de evolução da habilidade
  private levelUp(): void {
    this.level++;
    this.mastery = 0; // Reseta a maestria para o novo nível
    this.masteryToNextLevel = Math.round(this.masteryToNextLevel * 1.8);
    this.damageMultiplier = Number((this.damageMultiplier + 0.25).toFixed(2));
    this.upgradeCost = Math.round(this.upgradeCost * 1.5);
    UI.box([
      `🎉  [${this.name}] subiu para o NÍVEL ${this.level}!`,
      `💥  Multiplicador de dano: ${this.damageMultiplier}x`,
      `🎯  Próximo nível: ${this.masteryToNextLevel} usos  ou  💰 ${this.upgradeCost} Ouro`,
    ]);
  }

  // Cria uma cópia independente (clone) para quando o jogador comprar uma skill da loja
  public clone(): Skill {
    return new Skill(
      this.name,
      this.manaCost,
      this.damageMultiplier,
      this.upgradeCost,
      this.level,
      0,
      this.masteryToNextLevel
    );
  }

  public getDetails(): string {
    return `${this.name} (Nv. ${this.level}) | Custo: ${this.manaCost} MP | Dano: ${this.damageMultiplier}x | Maestria: ${this.mastery}/${this.masteryToNextLevel}`;
  }
}
