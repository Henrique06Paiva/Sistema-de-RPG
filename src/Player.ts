import { Character } from "./Character.js";
import { Skill } from "./Skill.js";

export abstract class Player extends Character {
  public mana: number;
  public maxMana: number;
  public gold: number;
  public level: number;
  public experience: number;
  public expToNextLevel: number;
  public skills: Skill[];
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
  }

  // Hook para subclasses aplicarem bônus de dano (crítico, fúria, etc.)
  public calculateAttackDamage(baseDamage: number): number {
    return baseDamage;
  }

  public override attack(target: Character): void {
    if (!this.isAlive()) {
      console.log(`❌ ${this.name} está inconsciente.`);
      return;
    }

    const damage = this.calculateAttackDamage(this.attackPower);
    console.log(`⚔️ ${this.name} ataca ${target.name} com força ${damage}!`);
    target.takeDamage(damage);
  }

  public gainReward(exp: number, gold: number): void {
    this.gold += gold;
    this.experience += exp;
    console.log(`\n💰 Você ganhou ${gold} de ouro! (Total: ${this.gold})`);
    console.log(
      `⭐ Você ganhou ${exp} de XP! (${this.experience}/${this.expToNextLevel})`
    );

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
    console.log(`\n🌟 LEVEL UP! ${this.name} alcançou o Nível ${this.level}!`);
  }

  public useSkill(skillIndex: number, target: Character): boolean {
    const skill = this.skills[skillIndex];
    if (!skill) {
      console.log("❌ Habilidade inválida!");
      return false;
    }

    if (this.mana < skill.manaCost) {
      console.log(`⚠️ Mana insuficiente! (${this.mana}/${skill.manaCost})`);
      return false;
    }

    this.mana -= skill.manaCost;
    const baseSkillDamage = Math.round(this.attackPower * skill.damageMultiplier);
    const finalDamage = this.calculateAttackDamage(baseSkillDamage);

    console.log(
      `\n🔥 ${this.name} usa [${skill.name} Nv.${skill.level}] causando ${finalDamage} de dano! (MP: ${this.mana}/${this.maxMana})`
    );

    target.takeDamage(finalDamage);
    skill.recordUsage();

    return true;
  }

  public rest(): void {
    this.heal(this.maxHealth);
    this.mana = this.maxMana;
    console.log(
      `\n🏕️ ${this.name} descansou confortavelmente junto à fogueira.`
    );
    console.log(`💚 Vida e 🔷 Mana totalmente restauradas!`);
  }

  public learnSkill(newSkill: Skill): void {
    const alreadyLearned = this.skills.some((s) => s.name === newSkill.name);
    if (alreadyLearned) {
      console.log(`⚠️ Você já domina a técnica [${newSkill.name}]!`);
      return;
    }
    this.skills.push(newSkill);
    console.log(`\n✨ Você aprendeu uma nova habilidade: [${newSkill.name}]!`);
  }

  public abstract getPassiveDescription(): string;
}
