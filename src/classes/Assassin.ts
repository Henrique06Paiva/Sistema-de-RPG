import { Player } from "../Player.js";
import { Skill } from "../Skill.js";

export class Assassin extends Player {
  public readonly className = "Assassino";

  constructor(name: string) {
    // HP: 95, ATK: 22, DEF: 4, MP: 65
    super(name, 95, 22, 4, 65);
    this.skills = [new Skill("Apunhalada Sombria", 18, 1.7, 45)];
  }

  // Passiva: Golpe Furtivo (35% de chance de crítico com 2x de dano)
  public override calculateAttackDamage(baseDamage: number): number {
    const isCritical = Math.random() < 0.35;
    if (isCritical) {
      console.log("⚡ [GOLPE FURTIVO CRÍTICO!] Acerto fatal causando dano DOBRADO (2x)!");
      return baseDamage * 2;
    }
    return baseDamage;
  }

  public getPassiveDescription(): string {
    return "Golpe Furtivo: 35% de chance de acerto crítico (dano x2).";
  }
}
