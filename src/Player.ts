import { Character } from "./Character.js";
import { Skill } from "./Skill.js";
import { Inventory } from "./Inventory.js";
import { Item } from "./Item.js";
import { UI } from "./UI.js";

export abstract class Player extends Character {
  public mana: number;
  public maxMana: number;
  public gold: number;
  public level: number;
  public experience: number;
  public expToNextLevel: number;
  public skills: Skill[];
  public inventory: Inventory;
  public abstract readonly className: string;

  constructor(
    name: string,
    maxHealth: number,
    attackPower: number,
    defense: number,
    maxMana: number
  ) {
    super(name, maxHealth, attackPower, defense);
    this.maxMana = maxMana;
    this.mana = maxMana;
    this.gold = 50;
    this.level = 1;
    this.experience = 0;
    this.expToNextLevel = 100;
    this.skills = [];
    this.inventory = new Inventory();

    // Itens iniciais de sobrevivência
    this.inventory.addItem(
      new Item("Poção de Vida Menor", "Cura 45 pontos de vida", 25, "health", 45),
      2
    );
    this.inventory.addItem(
      new Item("Poção de Mana Menor", "Restaura 35 pontos de mana", 20, "mana", 35),
      1
    );
  }

  // Hook para subclasses aplicarem bônus de dano (crítico, fúria, etc.)
  public calculateAttackDamage(baseDamage: number): number {
    return baseDamage;
  }

  public override attack(target: Character): void {
    if (!this.isAlive()) {
      UI.error(`${this.name} está inconsciente.`);
      return;
    }
    const damage = this.calculateAttackDamage(this.attackPower);
    UI.playerAction(`${this.name} golpeia ${target.name} com força ${damage}!`);
    target.takeDamage(damage);
  }

  public gainReward(exp: number, gold: number): void {
    this.gold += gold;
    this.experience += exp;
    UI.success(`+${gold} 💰 ouro ganhos!  (Total: ${this.gold})`);
    UI.info(`+${exp} ⭐ XP ganhos!  (${this.experience}/${this.expToNextLevel})`);

    while (this.experience >= this.expToNextLevel) {
      this.levelUp();
    }
  }

  protected levelUp(): void {
    this.experience -= this.expToNextLevel;
    this.level++;
    this.expToNextLevel = Math.round(this.expToNextLevel * 1.6);
    this.maxMana += 10;
    this.mana = this.maxMana;
    this.heal(this.maxHealth);
    UI.box([
      `🌟  LEVEL UP!  Nível ${this.level} alcançado!`,
      `❤️  HP e 💎 MP completamente restaurados!`,
      `⭐  Próximo nível em: ${this.expToNextLevel} XP`,
    ]);
  }

  public useSkill(skillIndex: number, target: Character): boolean {
    const skill = this.skills[skillIndex];
    if (!skill) {
      UI.error("Habilidade inválida!");
      return false;
    }

    if (this.mana < skill.manaCost) {
      UI.warning(`Mana insuficiente! Você tem ${this.mana} MP, mas a habilidade custa ${skill.manaCost} MP.`);
      return false;
    }

    this.mana -= skill.manaCost;
    const baseSkillDamage = Math.round(this.attackPower * skill.damageMultiplier);
    const finalDamage = this.calculateAttackDamage(baseSkillDamage);

    UI.playerAction(`${this.name} usa ✨ ${skill.name} Nv.${skill.level} ✨  causando ${finalDamage} de dano!  (MP: ${this.mana}/${this.maxMana})`);

    target.takeDamage(finalDamage);
    skill.recordUsage();

    return true;
  }

  public rest(): void {
    this.heal(this.maxHealth);
    this.mana = this.maxMana;
    UI.box([
      `🔥 ${this.name} descansou na fogueira do acampamento.`,
      `❤️  HP e 💎 MP restaurados completamente!`,
    ]);
  }

  public learnSkill(newSkill: Skill): void {
    const alreadyLearned = this.skills.some((s) => s.name === newSkill.name);
    if (alreadyLearned) {
      UI.warning(`Você já domina a técnica [${newSkill.name}]!`);
      return;
    }
    this.skills.push(newSkill);
    UI.success(`Nova habilidade aprendida: ✨ ${newSkill.name} ✨`);
  }

  public abstract getPassiveDescription(): string;
}
