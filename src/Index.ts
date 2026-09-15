import { select, input } from "@inquirer/prompts";
import { Character } from "./Character.js";
import { Player } from "./Player.js";
import { Skill } from "./Skill.js";
import { Item } from "./Item.js";
import { Warrior } from "./classes/Warrior.js";
import { Mage } from "./classes/Mage.js";
import { Tank } from "./classes/Tank.js";
import { Assassin } from "./classes/Assassin.js";

// Habilidades disponíveis no Mestre
const availableSkillsToBuy = [
  new Skill("Bola de Fogo", 20, 2.2, 70),
  new Skill("Golpe Devastador", 30, 3.0, 120),
  new Skill("Ataque Rápido", 10, 1.3, 30),
];

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
  console.log(`\n========================================`);
  console.log(`⚔️ UM ${enemy.name.toUpperCase()} BLOQUEIA SEU CAMINHO! ⚔️`);
  console.log(`========================================`);

  while (player.isAlive() && enemy.isAlive()) {
    console.log(
      `\n👤 ${player.name} | HP: ${player.getHealth()}/${player.maxHealth} | MP: ${player.mana}/${player.maxMana}`,
    );
    console.log(
      `👾 ${enemy.name} | HP: ${enemy.getHealth()}/${enemy.maxHealth}`,
    );

    let turnEnded = false;

    while (!turnEnded) {
      const action = await select({
        message: "O que você fará?",
        choices: [
          { name: "🗡️ Ataque Básico", value: "attack" },
          { name: "🔥 Usar Habilidade", value: "skill" },
          { name: "🧪 Usar Item do Inventário", value: "item" },
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
          { name: "⬅️ Voltar", value: -1 },
        ];

        const chosenIndex = await select({
          message: "Selecione a habilidade:",
          choices: skillChoices,
        });

        if (chosenIndex === -1) continue;

        const success = player.useSkill(chosenIndex, enemy);
        if (success) turnEnded = true;
      } else if (action === "item") {
        if (player.inventory.isEmpty()) {
          console.log("\n⚠️ Seu inventário está vazio!");
          continue;
        }

        const itemChoices = [
          ...player.inventory.getSlots().map((slot, index) => ({
            name: `🧪 ${slot.item.name} (x${slot.quantity}) - ${slot.item.description}`,
            value: index,
          })),
          { name: "⬅️ Voltar", value: -1 },
        ];

        const chosenItemIndex = await select({
          message: "Escolha um item para usar:",
          choices: itemChoices,
        });

        if (chosenItemIndex === -1) continue;

        const success = player.inventory.useItem(chosenItemIndex, player);
        if (success) turnEnded = true;
      }
    }

    if (enemy.isAlive()) {
      console.log(`\n--- Turno de ${enemy.name} ---`);
      enemy.attack(player);
    }
  }

  if (player.isAlive()) {
    console.log(`\n🎉 Vitória gloriosa contra ${enemy.name}!`);
    const expReward = 40 + dungeonFloor * 10;
    const goldReward = 20 + dungeonFloor * 8;
    player.gainReward(expReward, goldReward);
    dungeonFloor++;
    return true;
  } else {
    // Mecânica de Respawn e Penalidade de Derrota
    const goldLost = Math.floor(player.gold * 0.25);
    player.gold -= goldLost;
    const previousFloor = dungeonFloor;
    dungeonFloor = Math.max(1, dungeonFloor - 3);

    console.log(`\n======================================================`);
    console.log(`💀 VOCÊ FOI DERRUBADO EM COMBATE!`);
    console.log(`Um viajante misterioso o encontrou inconsciente e o carregou de volta ao Acampamento.`);
    console.log(`------------------------------------------------------`);
    console.log(`💸 Penalidade de Ouro: Você perdeu 💰 ${goldLost} moedas de ouro (Saldo atual: 💰 ${player.gold}).`);
    console.log(`📉 Recuo na Masmorra: Você recuou do Andar ${previousFloor} para o Andar ${dungeonFloor}.`);
    console.log(`✨ O descanso forçado restaurou sua vida e sua mana.`);
    console.log(`======================================================\n`);

    // Recupera o herói para que ele possa continuar a jornada
    player.rest();
    return false;
  }
}

// Menu de Treinamento com o Mestre
async function trainingGrounds(player: Player) {
  let inTraining = true;

  while (inTraining) {
    console.log(
      `\n🏛️ --- ÁREA DE TREINAMENTO (Seu Ouro: 💰 ${player.gold}) ---`,
    );
    const choice = await select({
      message: "Como deseja aprimorar suas habilidades?",
      choices: [
        { name: "⚡ Upar Habilidade Atual com Ouro", value: "upgrade" },
        { name: "📚 Aprender Nova Habilidade", value: "learn" },
        { name: "⬅️ Voltar ao Acampamento", value: "back" },
      ],
    });

    if (choice === "upgrade") {
      const choices = [
        ...player.skills.map((s, index) => ({
          name: `${s.name} (Nv. ${s.level} ➔ ${s.level + 1}) | Maestria: ${s.mastery}/${s.masteryToNextLevel} | Custo: 💰 ${s.upgradeCost} Ouro`,
          value: index,
        })),
        { name: "⬅️ Voltar", value: -1 },
      ];

      const selectedSkillIndex = await select({
        message: "Escolha qual habilidade quer treinar:",
        choices,
      });

      if (selectedSkillIndex !== -1) {
        const skill = player.skills[selectedSkillIndex];
        if (player.gold >= skill.upgradeCost) {
          player.gold -= skill.upgradeCost;
          skill.trainWithMaster();
        } else {
          console.log(
            `\n❌ Ouro insuficiente! Você tem 💰 ${player.gold}, mas precisa de 💰 ${skill.upgradeCost}.`
          );
        }
      }
    } else if (choice === "learn") {
      // Filtra habilidades que ele ainda não possui
      const unlearnedSkills = availableSkillsToBuy.filter(
        (as) => !player.skills.some((ps) => ps.name === as.name)
      );

      if (unlearnedSkills.length === 0) {
        console.log(
          "\n✨ Você já aprendeu todas as habilidades disponíveis no momento!"
        );
        continue;
      }

      const choices = [
        ...unlearnedSkills.map((s, index) => ({
          name: `[${s.name}] | Dano: ${s.damageMultiplier}x | Custo: ${s.manaCost} MP | Preço: 💰 ${s.upgradeCost} Ouro`,
          value: index,
        })),
        { name: "⬅️ Voltar", value: -1 },
      ];

      const selectedIndex = await select({
        message: "Escolha qual habilidade quer aprender:",
        choices,
      });

      if (selectedIndex !== -1) {
        const skillTemplate = unlearnedSkills[selectedIndex];
        if (player.gold >= skillTemplate.upgradeCost) {
          player.gold -= skillTemplate.upgradeCost;
          player.learnSkill(skillTemplate.clone());
        } else {
          console.log(
            `\n❌ Ouro insuficiente! Preço: 💰 ${skillTemplate.upgradeCost}, Seu saldo: 💰 ${player.gold}.`
          );
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
    console.log(`\n🛒 --- TENDA DO MERCADOR (Seu Ouro: 💰 ${player.gold}) ---`);
    console.log(`"Bem-vindo, aventureiro! Tenho os melhores elixires e poções para sua jornada."`);

    const choices = [
      ...availableItemsToBuy.map((item, index) => ({
        name: `🧪 ${item.name} | ${item.description} | Preço: 💰 ${item.price} Ouro`,
        value: index,
      })),
      { name: "⬅️ Sair da Loja", value: -1 },
    ];

    const chosenIndex = await select({
      message: "O que deseja comprar?",
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
      console.log(`💰 Você pagou ${selectedItem.price} de ouro. Saldo restante: 💰 ${player.gold}`);
    } else {
      console.log(`\n❌ Ouro insuficiente! O item custa 💰 ${selectedItem.price}, mas você só tem 💰 ${player.gold}.`);
    }
  }
}

// Menu da Ficha do Personagem
function showCharacterSheet(player: Player) {
  console.log(`\n================ FICHA DO HERÓI ================`);
  console.log(`👤 Nome: ${player.name} | Classe: ${player.className}`);
  console.log(`✨ Passiva: ${player.getPassiveDescription()}`);
  console.log(`⭐ Nível: ${player.level} (XP: ${player.experience}/${player.expToNextLevel})`);
  console.log(`💚 Vida Máxima: ${player.maxHealth} (Atual: ${player.getHealth()})`);
  console.log(`🔷 Mana Máxima: ${player.maxMana} (Atual: ${player.mana})`);
  console.log(`⚔️ Poder de Ataque: ${player.attackPower}`);
  console.log(`🛡️ Defesa: ${player.defense}`);
  console.log(`💰 Ouro: ${player.gold}`);
  console.log(`\n📖 Habilidades Dominadas:`);
  player.skills.forEach((s) => console.log(`   - ${s.getDetails()}`));
  console.log(`\n🎒 Mochila / Inventário:`);
  if (player.inventory.isEmpty()) {
    console.log(`   (Mochila vazia)`);
  } else {
    player.inventory.getSlots().forEach((slot) => {
      console.log(`   - 🧪 ${slot.item.name} (x${slot.quantity}) [${slot.item.description}]`);
    });
  }
  console.log(`=================================================\n`);
}

// Criação de Personagem com Escolha de Classe
async function createCharacter(): Promise<Player> {
  console.clear();
  console.log("==========================================");
  console.log("       🏰 CRIAÇÃO DE PERSONAGEM 🏰        ");
  console.log("==========================================\n");

  const name = await input({
    message: "Digite o nome do seu aventureiro:",
    default: "Aventureiro",
  });

  const chosenClass = await select({
    message: "Escolha a sua classe de combate:",
    choices: [
      {
        name: "🛡️ Tanque     | Vida: 160 | Defesa: 9 | Passiva: Reduz 20% do dano sofrido",
        value: "tank",
      },
      {
        name: "⚔️ Guerreiro  | Vida: 120 | Dano: 20  | Passiva: +50% de dano se vida < 50% (Fúria)",
        value: "warrior",
      },
      {
        name: "🧙 Mago       | Mana: 120 | Dano: 22  | Passiva: +25% de dano mágico geral",
        value: "mage",
      },
      {
        name: "🗡️ Assassino  | Dano: 22  | Defesa: 4 | Passiva: 35% de chance de Dano Crítico (2x)",
        value: "assassin",
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
  const hero = await createCharacter();

  console.log(`\n✨ Bem-vindo ao mundo, ${hero.name} o ${hero.className}! Que sua jornada seja gloriosa!\n`);

  let playing = true;
  while (playing && hero.isAlive()) {
    console.log(
      `\n🏕️ [ACAMPAMENTO - Andar da Masmorra: ${dungeonFloor}]`
    );
    console.log(
      `Status: HP ${hero.getHealth()}/${hero.maxHealth} | MP ${hero.mana}/${hero.maxMana} | Ouro: 💰 ${hero.gold}`
    );

    const choice = await select({
      message: "O que deseja fazer no acampamento?",
      choices: [
        { name: "🌲 Explorar a Masmorra (Batalhar)", value: "explore" },
        { name: "🛒 Tenda do Mercador (Comprar Poções)", value: "shop" },
        { name: "🏛️ Área de Treinamento (Habilidades)", value: "train" },
        { name: "🏕️ Descansar na Fogueira (Restaurar HP/MP)", value: "rest" },
        { name: "📜 Ver Ficha do Herói", value: "stats" },
        { name: "🚪 Sair do Jogo", value: "quit" },
      ],
    });

    if (choice === "explore") {
      const enemy = generateEnemy(dungeonFloor);
      await battle(hero, enemy);
      // Mesmo se for derrotado, o herói já renasce no acampamento com as penalidades aplicadas!
    } else if (choice === "shop") {
      await merchantShop(hero);
    } else if (choice === "train") {
      await trainingGrounds(hero);
    } else if (choice === "rest") {
      hero.rest();
    } else if (choice === "stats") {
      showCharacterSheet(hero);
    } else if (choice === "quit") {
      console.log("\nAté a próxima aventura! Obrigado por jogar!");
      playing = false;
    }
  }
}

main();
