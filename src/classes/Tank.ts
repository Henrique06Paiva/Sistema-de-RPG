import { Player } from "../Player.js";
import { Skill } from "../Skill.js";
import { UI } from "../UI.js";

export class Tank extends Player {
  public readonly className = "Tanque";

  constructor(name: string) {
    // HP: 160, ATK: 15, DEF: 9, MP: 40
    super(name, 160, 15, 9, 40);
    this.skills = [new Skill("Investida com Escudo", 15, 1.4, 45)];
  }

  // Passiva: Pele de Ferro (reduz 20% do dano recebido)
  public override takeDamage(damage: number): void {
    const reducedDamage = Math.max(1, Math.round(damage * 0.8));
    UI.info("🛡️ [PELE DE FERRO] Armadura pesada absorveu 20% do impacto!");
    super.takeDamage(reducedDamage);
  }

  public getPassiveDescription(): string {
    return "Pele de Ferro: Reduz em 20% o impacto de todos os golpes recebidos.";
  }
}
