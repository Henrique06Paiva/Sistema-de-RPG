import { Player } from "./Player.js";
import { UI } from "./UI.js";

export type ItemType = "health" | "mana" | "buff";

export class Item {
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly type: ItemType;
  public readonly effectValue: number;

  constructor(
    name: string,
    description: string,
    price: number,
    type: ItemType,
    effectValue: number
  ) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.type = type;
    this.effectValue = effectValue;
  }

  // Aplica o efeito do item no personagem
  public use(target: Player): boolean {
    if (this.type === "health") {
      if (target.getHealth() >= target.maxHealth) {
        UI.warning("Sua vida já está cheia! O item não foi consumido.");
        return false;
      }
      target.heal(this.effectValue);
      UI.heal(`${target.name} usou [${this.name}] e recuperou ${this.effectValue} de vida!  (HP: ${target.getHealth()}/${target.maxHealth})`);
      return true;
    }

    if (this.type === "mana") {
      if (target.mana >= target.maxMana) {
        UI.warning("Sua mana já está cheia! O item não foi consumido.");
        return false;
      }
      target.mana = Math.min(target.maxMana, target.mana + this.effectValue);
      UI.heal(`${target.name} usou [${this.name}] e restaurou ${this.effectValue} de mana!  (MP: ${target.mana}/${target.maxMana})`);
      return true;
    }

    return false;
  }

  public clone(): Item {
    return new Item(this.name, this.description, this.price, this.type, this.effectValue);
  }
}
