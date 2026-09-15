import { Item } from "./Item.js";
import { Player } from "./Player.js";

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export class Inventory {
  private slots: InventorySlot[];

  constructor() {
    this.slots = [];
  }

  // Adiciona um item ao inventário, acumulando quantidade se já existir
  public addItem(item: Item, quantity: number = 1): void {
    const existingSlot = this.slots.find((s) => s.item.name === item.name);
    if (existingSlot) {
      existingSlot.quantity += quantity;
    } else {
      this.slots.push({ item: item.clone(), quantity });
    }
    console.log(`📦 Adicionado ao inventário: +${quantity}x ${item.name}!`);
  }

  // Usa um item do inventário
  public useItem(index: number, player: Player): boolean {
    const slot = this.slots[index];
    if (!slot) {
      console.log(`❌ Item não encontrado!`);
      return false;
    }

    const wasUsed = slot.item.use(player);
    if (wasUsed) {
      slot.quantity--;
      if (slot.quantity <= 0) {
        // Remove o slot se acabaram os itens
        this.slots.splice(index, 1);
      }
      return true;
    }

    return false;
  }

  public getSlots(): InventorySlot[] {
    return this.slots;
  }

  public isEmpty(): boolean {
    return this.slots.length === 0;
  }
}
