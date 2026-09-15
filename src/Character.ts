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

    console.log(
      `${this.name} recebeu ${actualDamage} de dano! (vida restante: ${this.health}/${this.maxHealth})`,
    );

    if (!this.isAlive()) {
      console.log(`${this.name} foi derrotado!`);
    }
  }

  // ação de ataque
  public attack(target: Character): void {
    if (!this.isAlive()) {
      console.log(`${this.name} não pode atacar porque está derrotado!`);
      return;
    }

    console.log(
      `${this.name} ataca ${target.name} com força ${this.attackPower}!`,
    );
    target.takeDamage(this.attackPower);
  }

  // ação de cura
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    console.log(
      `💚 ${this.name} recuperou vida! Atual: ${this.health}/${this.maxHealth}`,
    );
  }
}
