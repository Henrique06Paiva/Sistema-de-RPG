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
    console.log(
      `📖 Prática com [${this.name}]: ${this.mastery}/${this.masteryToNextLevel} usos.`
    );

    if (this.mastery >= this.masteryToNextLevel) {
      console.log(`✨ Você dominou melhor essa técnica através da prática!`);
      this.levelUp();
    }
  }

  // Treinar pagando o mestre de habilidades
  public trainWithMaster(): void {
    console.log(`\n🎓 Você treinou com o Mestre e aprimorou a técnica [${this.name}]!`);
    this.levelUp();
  }

  // Regra de evolução da habilidade
  private levelUp(): void {
    this.level++;
    this.mastery = 0; // Reseta a maestria para o novo nível
    this.masteryToNextLevel = Math.round(this.masteryToNextLevel * 1.8);
    this.damageMultiplier = Number((this.damageMultiplier + 0.25).toFixed(2));
    this.upgradeCost = Math.round(this.upgradeCost * 1.5);

    console.log(
      `🎉 Habilidade [${this.name}] subiu para o NÍVEL ${this.level}!`
    );
    console.log(
      `💥 Multiplicador de dano aumentado para: ${this.damageMultiplier}x`
    );
    console.log(
      `🎯 Próximo nível exigirá: ${this.masteryToNextLevel} usos ou 💰 ${this.upgradeCost} Ouro.\n`
    );
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
