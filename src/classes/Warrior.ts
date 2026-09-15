import { Player } from "../Player.js";
import { Skill } from "../Skill.js";

export class Warrior extends Player {
  public readonly className = "Guerreiro";

  constructor(name: string) {
    // HP: 120, ATK: 20, DEF: 6, MP: 50
    super(name, 120, 20, 6, 50);
    this.skills = [new Skill("Golpe Pesado", 15, 1.6, 40)];
  }

  // Passiva: Fúria de Batalha (quando vida < 50%, ganha +50% de ataque)
  public override calculateAttackDamage(baseDamage: number): number {
    const isEnraged = this.getHealth() < this.maxHealth * 0.5;
    if (isEnraged) {
      const bonus = Math.round(baseDamage * 0.5);
      console.log("🩸 [FÚRIA DE BATALHA!] Vida abaixo de 50%! Dano aumentado em +50%!");
      return baseDamage + bonus;
    }
    return baseDamage;
  }

  public getPassiveDescription(): string {
    return "Fúria de Batalha: Causa +50% de dano se a vida estiver abaixo de 50%.";
  }
}
