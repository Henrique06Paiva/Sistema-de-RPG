import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { Player } from "./Player.js";
import { Skill } from "./Skill.js";
import { Item, ItemType } from "./Item.js";
import { Warrior } from "./classes/Warrior.js";
import { Mage } from "./classes/Mage.js";
import { Tank } from "./classes/Tank.js";
import { Assassin } from "./classes/Assassin.js";

const SAVES_DIR = path.resolve(process.cwd(), "saves");

export interface SavedSkillData {
  name: string;
  manaCost: number;
  damageMultiplier: number;
  upgradeCost: number;
  level: number;
  mastery: number;
  masteryToNextLevel: number;
}

export interface SavedInventorySlotData {
  name: string;
  description: string;
  price: number;
  type: ItemType;
  effectValue: number;
  quantity: number;
}

export interface SaveData {
  name: string;
  className: string;
  maxHealth: number;
  health: number;
  attackPower: number;
  defense: number;
  maxMana: number;
  mana: number;
  gold: number;
  level: number;
  experience: number;
  expToNextLevel: number;
  dungeonFloor: number;
  skills: SavedSkillData[];
  inventory: SavedInventorySlotData[];
  savedAt: string;
}

export interface SaveSlotInfo {
  fileName: string;
  summary: string;
  saveData: SaveData;
}

export class SaveManager {
  // Garante que a pasta 'saves' exista
  private static ensureSavesDir(): void {
    if (!fs.existsSync(SAVES_DIR)) {
      fs.mkdirSync(SAVES_DIR, { recursive: true });
    }
  }

  // Lista todos os saves disponíveis na pasta
  public static listSaves(): SaveSlotInfo[] {
    this.ensureSavesDir();
    const files = fs.readdirSync(SAVES_DIR).filter((f) => f.endsWith(".json"));

    const slots: SaveSlotInfo[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(SAVES_DIR, file);
        const data: SaveData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        slots.push({
          fileName: file,
          summary: `${data.name} (${data.className} Nv. ${data.level}) | Masmorra: Andar ${data.dungeonFloor} | Ouro: 💰 ${data.gold} [${data.savedAt}]`,
          saveData: data,
        });
      } catch {
        // Ignora arquivos corrompidos
      }
    }

    return slots;
  }

  public static hasSaves(): boolean {
    return this.listSaves().length > 0;
  }

  // Salva o progresso do jogador em um arquivo com o nome dele
  public static save(player: Player, dungeonFloor: number): boolean {
    try {
      this.ensureSavesDir();
      // Sanitiza o nome para ser um arquivo válido no Windows
      const sanitizedName = player.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filePath = path.join(SAVES_DIR, `${sanitizedName}.json`);

      const saveData: SaveData = {
        name: player.name,
        className: player.className,
        maxHealth: player.maxHealth,
        health: player.getHealth(),
        attackPower: player.attackPower,
        defense: player.defense,
        maxMana: player.maxMana,
        mana: player.mana,
        gold: player.gold,
        level: player.level,
        experience: player.experience,
        expToNextLevel: player.expToNextLevel,
        dungeonFloor: dungeonFloor,
        skills: player.skills.map((s) => ({
          name: s.name,
          manaCost: s.manaCost,
          damageMultiplier: s.damageMultiplier,
          upgradeCost: s.upgradeCost,
          level: s.level,
          mastery: s.mastery,
          masteryToNextLevel: s.masteryToNextLevel,
        })),
        inventory: player.inventory.getSlots().map((slot) => ({
          name: slot.item.name,
          description: slot.item.description,
          price: slot.item.price,
          type: slot.item.type,
          effectValue: slot.item.effectValue,
          quantity: slot.quantity,
        })),
        savedAt: new Date().toLocaleString("pt-BR"),
      };

      fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2), "utf-8");
      console.log(`\n💾 Jogo salvo com sucesso em [saves/${sanitizedName}.json]!`);
      return true;
    } catch (error) {
      console.error("\n❌ Erro ao salvar o jogo:", error);
      return false;
    }
  }

  // Carrega um arquivo específico da pasta saves
  public static load(fileName: string): { player: Player; dungeonFloor: number } | null {
    try {
      const filePath = path.join(SAVES_DIR, fileName);
      if (!fs.existsSync(filePath)) return null;

      const data: SaveData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      let player: Player;
      switch (data.className) {
        case "Guerreiro":
          player = new Warrior(data.name);
          break;
        case "Mago":
          player = new Mage(data.name);
          break;
        case "Tanque":
          player = new Tank(data.name);
          break;
        case "Assassino":
          player = new Assassin(data.name);
          break;
        default:
          player = new Warrior(data.name);
          break;
      }

      (player as any).health = data.health;
      (player as any).maxHealth = data.maxHealth;
      (player as any).attackPower = data.attackPower;
      (player as any).defense = data.defense;
      player.maxMana = data.maxMana;
      player.mana = data.mana;
      player.gold = data.gold;
      player.level = data.level;
      player.experience = data.experience;
      player.expToNextLevel = data.expToNextLevel;

      player.skills = data.skills.map(
        (s) =>
          new Skill(
            s.name,
            s.manaCost,
            s.damageMultiplier,
            s.upgradeCost,
            s.level,
            s.mastery,
            s.masteryToNextLevel
          )
      );

      (player.inventory as any).slots = [];
      data.inventory.forEach((slotData) => {
        const item = new Item(
          slotData.name,
          slotData.description,
          slotData.price,
          slotData.type,
          slotData.effectValue
        );
        player.inventory.addItem(item, slotData.quantity);
      });

      console.log(`\n📂 Progresso de ${data.name} carregado com sucesso!`);
      return { player, dungeonFloor: data.dungeonFloor };
    } catch (error) {
      console.error("\n❌ Erro ao carregar o arquivo de save:", error);
      return null;
    }
  }

  // Exclui um arquivo de save do disco
  public static deleteSave(fileName: string): boolean {
    try {
      const filePath = path.join(SAVES_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`\n🗑️ Arquivo de save [${fileName}] excluído com sucesso!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("\n❌ Erro ao excluir o save:", error);
      return false;
    }
  }
}
