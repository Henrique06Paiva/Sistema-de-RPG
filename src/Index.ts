import { select, input } from "@inquirer/prompts";
import { UI } from "./UI.js";
import { Character } from "./Character.js";
import { Player } from "./Player.js";
import { Skill } from "./Skill.js";
import { Item } from "./Item.js";
import { SaveManager } from "./SaveManager.js";
import { Warrior } from "./classes/Warrior.js";
import { Mage } from "./classes/Mage.js";
import { Tank } from "./classes/Tank.js";
import { Assassin } from "./classes/Assassin.js";

// Catálogo de habilidades exclusivas por classe
const classSkillsCatalog: Record<string, Skill[]> = {
  Guerreiro: [
    new Skill("Ataque Rápido", 10, 1.3, 35),
    new Skill("Tormenta de Aço", 25, 2.4, 80),
    new Skill("Golpe Devastador", 35, 3.2, 130),
  ],
  Mago: [
    new Skill("Bola de Fogo", 20, 2.2, 60),
    new Skill("Nevasca Congelante", 35, 2.8, 95),
    new Skill("Meteoro Arcano", 55, 3.8, 160),
  ],
  Tanque: [
    new Skill("Esmagar Escudo", 15, 1.6, 40),
    new Skill("Bastilha Protetora", 25, 2.1, 80),
    new Skill("Impacto Sísmico", 35, 2.7, 125),
  ],
  Assassino: [
    new Skill("Ataque Rápido", 10, 1.3, 35),
    new Skill("Lâmina Venenosa", 22, 2.3, 75),
    new Skill("Dança das Sombras", 35, 3.4, 140),
  ],
};

// Itens à venda na Loja do Mercador
const availableItemsToBuy = [
  new Item("Poção de Vida Menor", "Recupera 45 HP", 20, "health", 45),
  new Item("Poção de Vida Média", "Recupera 80 HP", 35, "health", 80),
  new Item("Poção de Vida Maior", "Recupera 140 HP", 60, "health", 140),
  new Item("Poção de Mana Menor", "Restaura 35 MP", 18, "mana", 35),
  new Item("Poção de Mana Média", "Restaura 70 MP", 30, "mana", 70),
  new Item("Poção de Mana Maior", "Restaura 120 MP", 50, "mana", 120),
];

// Gerador de inimigos conforme a masmorra avança
let dungeonFloor = 1;
function generateEnemy(floor: number): Character {
  const enemyTypes = [
    { name: "Goblin Saqueador", hp: 45, atk: 14, def: 2 },
    { name: "Lobo Faminto", hp: 55, atk: 18, def: 3 },
    { name: "Orc Guerreiro", hp: 80, atk: 22, def: 5 },
    { name: "Esqueleto Amaldiçoado", hp: 65, atk: 24, def: 4 },
  ];

  // Escolhe um tipo baseado no andar
  const base = enemyTypes[(floor - 1) % enemyTypes.length];
  // Aplica escala de poder com base no andar da masmorra
  const scaledHp = base.hp + (floor - 1) * 15;
  const scaledAtk = base.atk + (floor - 1) * 3;
  const scaledDef = base.def + Math.floor(floor / 2);

  return new Character(
    `${base.name} (Andar ${floor})`,
    scaledHp,
    scaledAtk,
    scaledDef,
  );
}

// Sistema de Combate
async function battle(player: Player, enemy: Character): Promise<boolean> {
  UI.header("⚔️  COMBATE  ⚔️", enemy.name.toUpperCase());
  let turnNumber = 0;

  while (player.isAlive() && enemy.isAlive()) {
    turnNumber++;
    UI.separator(`TURNO ${turnNumber}`);

    console.log(`\n  👤 ${player.name} (${player.className})`);
    console.log(UI.bar(player.getHealth(), player.maxHealth, "❤️", "HP"));
    console.log(UI.bar(player.mana, player.maxMana, "💎", "MP"));
    console.log(`\n  👾 ${enemy.name}`);
    console.log(UI.bar(enemy.getHealth(), enemy.maxHealth, "❤️", "HP"));
    console.log("");

    let turnEnded = false;

    while (!turnEnded) {
      const action = await select({
        message: "⚡ Escolha sua ação:",
        choices: [
          { name: "🗡️  Ataque Básico       — sem custo de mana", value: "attack" },
          { name: "✨  Usar Habilidade     — gasta mana, mais dano", value: "skill" },
          { name: "🧪  Usar Item           — use uma poção do inventário", value: "item" },
        ],
      });

      if (action === "attack") {
        player.attack(enemy);
        turnEnded = true;
      } else if (action === "skill") {
        const skillChoices = [
          ...player.skills.map((s, index) => ({
            name: s.getDetails(),
            value: index,
          })),
          { name: "⬅️  Voltar", value: -1 },
        ];

        const chosenIndex = await select({
          message: "✨ Selecione a habilidade:",
          choices: skillChoices,
        });

        if (chosenIndex === -1) continue;

        const success = player.useSkill(chosenIndex, enemy);
        if (success) turnEnded = true;
      } else if (action === "item") {
        if (player.inventory.isEmpty()) {
          UI.warning("Seu inventário está vazio!");
          continue;
        }

        const itemChoices = [
          ...player.inventory.getSlots().map((slot, index) => ({
            name: `🧪 ${slot.item.name} (x${slot.quantity})  —  ${slot.item.description}`,
            value: index,
          })),
          { name: "⬅️  Voltar", value: -1 },
        ];

        const chosenItemIndex = await select({
          message: "🎒 Escolha um item para usar:",
          choices: itemChoices,
        });

        if (chosenItemIndex === -1) continue;

        const success = player.inventory.useItem(chosenItemIndex, player);
        if (success) turnEnded = true;
      }
    }

    if (enemy.isAlive()) {
      UI.separator("Turno do Inimigo");
      enemy.attack(player);
    }
  }

  if (player.isAlive()) {
    const expReward = 40 + dungeonFloor * 10;
    const goldReward = 20 + dungeonFloor * 8;
    UI.box([
      "🎉  VITÓRIA GLORIOSA!",
      `${enemy.name} foi derrotado!`,
      `Recompensas: +${expReward} ⭐ XP  e  +${goldReward} 💰 Ouro`,
    ]);
    player.gainReward(expReward, goldReward);
    dungeonFloor++;
    return true;
  } else {
    UI.box([
      "💀  DERROTA...",
      `${player.name} sucumbiu diante de ${enemy.name}.`,
      "Voltando ao acampamento...",
    ]);
    return false;
  }
}

// Menu de Treinamento com o Mestre
async function trainingGrounds(player: Player) {
  let inTraining = true;

  while (inTraining) {
    UI.header("🏛️  ÁREA DE TREINAMENTO");
    console.log(`\n  💰 Ouro disponível: ${player.gold}\n`);
    const choice = await select({
      message: "Como deseja aprimorar suas habilidades?",
      choices: [
        {
          name: "⚡ Treinar Habilidade Existente",
          value: "upgrade",
          description: "Pague ouro ao Mestre para subir o nível de uma habilidade já aprendida",
        },
        {
          name: "📚 Aprender Nova Habilidade",
          value: "learn",
          description: `Aprenda novas técnicas exclusivas da classe ${player.className}`,
        },
        { name: "⬅️  Voltar ao Acampamento", value: "back" },
      ],
    });

    if (choice === "upgrade") {
      const choices = [
        ...player.skills.map((s, index) => ({
          name: `${s.name}  (Nv. ${s.level} → ${s.level + 1})  |  Maestria: ${s.mastery}/${s.masteryToNextLevel}  |  💰 ${s.upgradeCost} Ouro`,
          value: index,
        })),
        { name: "⬅️  Voltar", value: -1 },
      ];

      const selectedSkillIndex = await select({
        message: "⚡ Escolha qual habilidade quer treinar:",
        choices,
      });

      if (selectedSkillIndex !== -1) {
        const skill = player.skills[selectedSkillIndex];
        if (player.gold >= skill.upgradeCost) {
          player.gold -= skill.upgradeCost;
          skill.trainWithMaster();
        } else {
          UI.error(`Ouro insuficiente! Você tem 💰 ${player.gold}, mas precisa de 💰 ${skill.upgradeCost}.`);
        }
      }
    } else if (choice === "learn") {
      // Obtém apenas as habilidades da classe atual do herói
      const classSkills = classSkillsCatalog[player.className] || [];
      const unlearnedSkills = classSkills.filter(
        (as) => !player.skills.some((ps) => ps.name === as.name)
      );

      if (unlearnedSkills.length === 0) {
        UI.success(`Você já dominou todas as técnicas disponíveis para a classe ${player.className}!`);
        continue;
      }

      const choices = [
        ...unlearnedSkills.map((s, index) => ({
          name: `✨ ${s.name}  |  Dano: ${s.damageMultiplier}x  |  Custo: ${s.manaCost} MP  |  💰 ${s.upgradeCost} Ouro`,
          value: index,
        })),
        { name: "⬅️  Voltar", value: -1 },
      ];

      const selectedIndex = await select({
        message: "📚 Escolha qual habilidade quer aprender:",
        choices,
      });

      if (selectedIndex !== -1) {
        const skillTemplate = unlearnedSkills[selectedIndex];
        if (player.gold >= skillTemplate.upgradeCost) {
          player.gold -= skillTemplate.upgradeCost;
          player.learnSkill(skillTemplate.clone());
        } else {
          UI.error(`Ouro insuficiente! Preço: 💰 ${skillTemplate.upgradeCost}  |  Seu saldo: 💰 ${player.gold}`);
        }
      }
    } else if (choice === "back") {
      inTraining = false;
    }
  }
}

// Loja do Mercador
async function merchantShop(player: Player) {
  let shopping = true;

  while (shopping) {
    UI.header("🛒  TENDA DO MERCADOR");
    console.log(`\n  💰 Ouro disponível: ${player.gold}`);
    UI.info(`"Bem-vindo, aventureiro! Tenho os melhores elixires para sua jornada!"`);
    console.log("");

    const choices = [
      ...availableItemsToBuy.map((item, index) => ({
        name: `🧪 ${item.name}  —  ${item.description}  |  💰 ${item.price} Ouro`,
        value: index,
      })),
      { name: "⬅️  Sair da Loja", value: -1 },
    ];

    const chosenIndex = await select({
      message: "🛒 O que deseja comprar?",
      choices,
    });

    if (chosenIndex === -1) {
      shopping = false;
      continue;
    }

    const selectedItem = availableItemsToBuy[chosenIndex];
    if (player.gold >= selectedItem.price) {
      player.gold -= selectedItem.price;
      player.inventory.addItem(selectedItem, 1);
      UI.success(`Compra realizada! Você pagou 💰 ${selectedItem.price}.  Saldo restante: 💰 ${player.gold}`);
    } else {
      UI.error(`Ouro insuficiente! O item custa 💰 ${selectedItem.price}, mas você só tem 💰 ${player.gold}.`);
    }
  }
}

// Menu da Ficha do Personagem
function showCharacterSheet(player: Player) {
  UI.header("📜  FICHA DO HERÓI", `${player.name}  —  ${player.className}`);

  console.log(`\n  ✨ Passiva: ${player.getPassiveDescription()}\n`);

  console.log(UI.bar(player.getHealth(), player.maxHealth, "❤️", "HP"));
  console.log(UI.bar(player.mana, player.maxMana, "💎", "MP"));
  console.log(UI.bar(player.experience, player.expToNextLevel, "⭐", "XP"));

  console.log(`\n  📊 Nível:             ${player.level}`);
  console.log(`  ⚔️  Poder de Ataque: ${player.attackPower}`);
  console.log(`  🛡️  Defesa:          ${player.defense}`);
  console.log(`  💰 Ouro:             ${player.gold}`);

  UI.separator("Habilidades");
  if (player.skills.length === 0) {
    UI.info("Nenhuma habilidade aprendida ainda.");
  } else {
    player.skills.forEach((s) => {
      console.log(`\n  📖 ${s.name}  (Nível ${s.level})`);
      console.log(`      Dano: ${s.damageMultiplier}x  |  Custo: ${s.manaCost} MP  |  Maestria: ${s.mastery}/${s.masteryToNextLevel}`);
    });
  }

  UI.separator("Inventário");
  if (player.inventory.isEmpty()) {
    UI.info("Mochila vazia.");
  } else {
    player.inventory.getSlots().forEach((slot) => {
      console.log(`  🧪 ${slot.item.name}  (x${slot.quantity})  —  ${slot.item.description}`);
    });
  }

  console.log("");
  UI.separator();
}

// Criação de Personagem com Escolha de Classe
async function createCharacter(): Promise<Player> {
  UI.clear();
  UI.header("🏰  CRIAÇÃO DE PERSONAGEM  🏰", "Escolha seu destino, aventureiro");
  console.log("");

  const name = await input({
    message: "  ✏️  Nome do seu aventureiro:",
    default: "Aventureiro",
  });

  const chosenClass = await select({
    message: "  🎭 Escolha sua classe de combate:",
    choices: [
      {
        name: "🛡️  Tanque",
        value: "tank",
        description: "Vida: 160 | Defesa: 9 | Passiva: Reduz 20% do dano sofrido (Pele de Ferro)",
      },
      {
        name: "⚔️  Guerreiro",
        value: "warrior",
        description: "Vida: 120 | Dano: 20 | Passiva: +50% de dano quando HP < 50% (Fúria de Batalha)",
      },
      {
        name: "🧙  Mago",
        value: "mage",
        description: "Mana: 120 | Dano: 22 | Passiva: +25% de dano em todas as habilidades (Maestria Arcana)",
      },
      {
        name: "🗡️  Assassino",
        value: "assassin",
        description: "Dano: 22 | Defesa: 4 | Passiva: 35% de chance de Golpe Crítico 2x (Golpe Furtivo)",
      },
    ],
  });

  switch (chosenClass) {
    case "tank":
      return new Tank(name);
    case "warrior":
      return new Warrior(name);
    case "mage":
      return new Mage(name);
    case "assassin":
      return new Assassin(name);
    default:
      return new Warrior(name);
  }
}

// Loop Principal do Jogo
async function main() {
  UI.clear();
  UI.header("⚔️  RPG EM TYPESCRIPT  ⚔️", "Uma jornada épica te aguarda...");

  let hero: Player | null = null;

  // Menu inicial com suporte a múltiplos saves
  while (!hero) {
    if (SaveManager.hasSaves()) {
      const startChoice = await select({
        message: "📋 Menu Principal:",
        choices: [
          {
            name: "📂 Carregar Personagem Salvo",
            value: "load",
            description: "Retomar a aventura de um herói salvo anteriormente",
          },
          {
            name: "✨ Novo Jogo",
            value: "new",
            description: "Criar um novo herói e começar do zero",
          },
          {
            name: "🗑️  Excluir um Save",
            value: "delete",
            description: "Apagar permanentemente um save existente",
          },
          {
            name: "🚪 Fechar Jogo",
            value: "exit",
            description: "Encerrar o RPG",
          },
        ],
      });

      if (startChoice === "load") {
        const saves = SaveManager.listSaves();
        const loadChoices = [
          ...saves.map((s) => ({
            name: `📂 ${s.summary}`,
            value: s.fileName,
          })),
          { name: "⬅️  Voltar", value: "back" },
        ];

        const selectedFile = await select({
          message: "📂 Escolha qual herói deseja carregar:",
          choices: loadChoices,
        });

        if (selectedFile !== "back") {
          const loaded = SaveManager.load(selectedFile);
          if (loaded) {
            hero = loaded.player;
            dungeonFloor = loaded.dungeonFloor;
          }
        }
      } else if (startChoice === "delete") {
        const saves = SaveManager.listSaves();
        const deleteChoices = [
          ...saves.map((s) => ({
            name: `🗑️  ${s.summary}`,
            value: s.fileName,
          })),
          { name: "⬅️  Voltar", value: "back" },
        ];

        const fileToDelete = await select({
          message: "⚠️  Escolha qual save deseja EXCLUIR permanentemente:",
          choices: deleteChoices,
        });

        if (fileToDelete !== "back") {
          const confirm = await select({
            message: `⚠️  Confirmar exclusão do save [${fileToDelete}]?`,
            choices: [
              { name: "🗑️  Sim, apagar permanentemente", value: true },
              { name: "⬅️  Não, cancelar", value: false },
            ],
          });

          if (confirm) {
            SaveManager.deleteSave(fileToDelete);
          }
        }
      } else if (startChoice === "new") {
        hero = await createCharacter();
      } else if (startChoice === "exit") {
        UI.box(["🚪 Até logo!", "Volte quando quiser uma nova aventura... ⚔️"]);
        return;
      }
    } else {
      hero = await createCharacter();
    }
  }

  UI.box([
    `✨ Bem-vindo, ${hero.name} o ${hero.className}!`,
    "Que sua jornada seja épica e gloriosa!",
  ]);

  let playing = true;
  while (playing && hero.isAlive()) {
    UI.header("🏕️  ACAMPAMENTO", `Andar da Masmorra: ${dungeonFloor}`);
    console.log(UI.bar(hero.getHealth(), hero.maxHealth, "❤️", "HP"));
    console.log(UI.bar(hero.mana, hero.maxMana, "💎", "MP"));
    console.log(UI.bar(hero.experience, hero.expToNextLevel, "⭐", "XP"));
    console.log(`\n  💰 Ouro: ${hero.gold}  |  📊 Nível: ${hero.level}  |  🏹 ${hero.className}`);
    console.log("");

    const choice = await select({
      message: "⚔️  O que deseja fazer?",
      choices: [
        {
          name: "⚔️  Explorar a Masmorra",
          value: "explore",
          description: `Avançar para o Andar ${dungeonFloor} e enfrentar inimigos`,
        },
        {
          name: "🛒 Tenda do Mercador",
          value: "shop",
          description: "Comprar poções e itens de cura com ouro",
        },
        {
          name: "🏛️  Área de Treinamento",
          value: "train",
          description: "Aprender e aprimorar habilidades com o Mestre",
        },
        {
          name: "🔥 Descansar na Fogueira",
          value: "rest",
          description: "Restaurar HP e MP completamente (gratuito)",
        },
        {
          name: "📜 Ficha do Herói",
          value: "stats",
          description: "Ver atributos, habilidades e inventário",
        },
        {
          name: "💾 Salvar Jogo",
          value: "save",
          description: "Salvar o progresso atual neste slot",
        },
        {
          name: "🚪 Sair do Jogo",
          value: "quit",
          description: "Encerrar a sessão (com opção de salvar)",
        },
      ],
    });

    if (choice === "explore") {
      const enemy = generateEnemy(dungeonFloor);
      await battle(hero, enemy);
    } else if (choice === "shop") {
      await merchantShop(hero);
    } else if (choice === "train") {
      await trainingGrounds(hero);
    } else if (choice === "rest") {
      hero.rest();
    } else if (choice === "stats") {
      showCharacterSheet(hero);
    } else if (choice === "save") {
      SaveManager.save(hero, dungeonFloor);
    } else if (choice === "quit") {
      const wantSave = await select({
        message: "💾 Deseja salvar o progresso antes de sair?",
        choices: [
          { name: "💾 Sim, salvar e sair", value: true },
          { name: "🚪 Não, sair sem salvar", value: false },
        ],
      });

      if (wantSave) {
        SaveManager.save(hero, dungeonFloor);
      }

      UI.box(["🚪 Até a próxima aventura!", "Obrigado por jogar! ⚔️"]);
      playing = false;
    }
  }
}

main();
