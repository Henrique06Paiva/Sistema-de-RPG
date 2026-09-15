import { Player } from "../Player.js";
import { Skill } from "../Skill.js";

export class Mage extends Player {
  public readonly className = "Mago";

  constructor(name: string) {
    // HP: 85, ATK: 22, DEF: 3, MP: 120
    super(name, 85, 22, 3, 120);
    this.skills = [new Skill("Raio Arcano", 20, 2.0, 50)];
  }

  // Passiva: Maestria Arcana (+25% de dano mágico geral)
  public override calculateAttackDamage(baseDamage: number): number {
    return Math.round(baseDamage * 1.25);
  }

  public getPassiveDescription(): string {
    return "Maestria Arcana: +25% de dano mágico geral e enorme reserva de Mana.";
  }
}
