# 🏰 TypeScript RPG Engine

Um RPG tático por turnos jogável diretamente no terminal, desenvolvido em **TypeScript** e **Node.js** com foco em boas práticas de Engenharia de Software e Programação Orientada a Objetos (POO).

## 🚀 Funcionalidades

- **Criação de Personagens com Classes e Passivas Únicas:**
  - 🛡️ **Tanque:** Alta resistência com passiva *Pele de Ferro* (reduz 20% do dano recebido).
  - ⚔️ **Guerreiro:** Ataque balanceado com passiva *Fúria de Batalha* (+50% de dano se a vida estiver abaixo de 50%).
  - 🧙 **Mago:** Alta reserva de Mana com passiva *Maestria Arcana* (+25% de dano mágico geral).
  - 🗡️ **Assassino:** Letal e ágil com passiva *Golpe Furtivo* (35% de chance de causar acertos críticos com 2x de dano).
- **Sistema de Habilidades & Maestria por Uso:**
  - As habilidades evoluem conforme você as usa em combate (ganho de experiência/proficiência).
  - Possibilidade de treinar e comprar novas habilidades com ouro no Acampamento.
- **Hub do Jogador (Acampamento):**
  - Exploração de Masmorra com escala de dificuldade por andar.
  - Centro de Treinamento com Mestre de Habilidades.
  - Fogueira para descanso e regeneração de HP/MP.
  - Ficha detalhada do herói.
- **Interface Interativa:**
  - Menus navegáveis pelo teclado via @inquirer/prompts.

## 🛠️ Tecnologias e Conceitos Aplicados

- **Linguagem:** TypeScript (NodeNext / ESM)
- **Runtime:** Node.js (executado via 	sx)
- **Conceitos de POO:**
  - Classes Abstratas e Herança (Player -> Warrior, Mage, Tank, Assassin)
  - Encapsulamento de regras de combate e maestria
  - Polimorfismo e ganchos (*hooks*) de regras passivas
  - Composição de Habilidades

## 📦 Como Rodar Localmente

1. Clone o repositório:
`ash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd RPG
`

2. Instale as dependências:
`ash
npm install
`

3. Execute o jogo:
`ash
npm start
`
