import { UI } from "./UI.js";

export class Character {
  public readonly name: string;
  private health: number;
  public readonly maxHealth: number;
  public readonly attackPower: number;
  public readonly defense: number;

  constructor(
    name: string,
    maxHealth: number,
    attackPower: number,
    defense: number,
  ) {
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.attackPower = attackPower;
    this.defense = defense;
  }

  public getHealth(): number {
    return this.health;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  // ação de receber dano
  public takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.defense);
    this.health = Math.max(0, this.health - actualDamage);
    UI.damage(`${this.name} sofreu ${actualDamage} de dano!  (HP: ${this.health}/${this.maxHealth})`);
    if (!this.isAlive()) {
      console.log(`\n     ☠️  ${this.name} foi derrotado!`);
    }
  }

  // ação de ataque (usada pelos inimigos — Player sobrescreve este método)
  public attack(target: Character): void {
    if (!this.isAlive()) {
      UI.error(`${this.name} não pode atacar — está derrotado!`);
      return;
    }
    UI.enemyAction(`${this.name} ataca com força brutal de ${this.attackPower}!`);
    target.takeDamage(this.attackPower);
  }

  // ação de cura (silenciosa — o chamador é responsável por exibir o feedback)
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
