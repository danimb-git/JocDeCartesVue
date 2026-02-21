<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import movesCatalog from '../data/moves.json'
import CharacterCard from '../components/CharacterCard.vue'
import { selectionState } from '../selectionState'

const router = useRouter()

const typeChart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, ice: 0.5, ground: 2, flying: 2, grass: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { fighting: 2, bug: 2, grass: 2, rock: 0.5, electric: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 }
}

const pokedex = ref([])
const activeAttackerIndex = ref(0)
const battleMessage = ref('')
const isMessageVisible = ref(false)
const isLoading = ref(true)
const isBattleOver = ref(false)

const splitByComma = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const normalizeType = (type) => String(type).trim().toLowerCase()

const buildMoves = (movesValue) => {
  return splitByComma(movesValue)
    .map((moveName) => {
      const fromCatalog = movesCatalog.find((move) => move.name.toLowerCase() === moveName.toLowerCase())

      if (fromCatalog) {
        return {
          id: fromCatalog.id,
          name: fromCatalog.name,
          accuracy: fromCatalog.accuracy ?? 100,
          power: fromCatalog.power ?? 60,
          type: normalizeType(fromCatalog.type)
        }
      }

      return {
        id: moveName,
        name: moveName,
        accuracy: 100,
        power: 60,
        type: 'normal'
      }
    })
    .slice(0, 4)
}

const showBattleMessage = (text, duration = 2000) => {
  return new Promise((resolve) => {
    battleMessage.value = text
    isMessageVisible.value = true

    setTimeout(() => {
      isMessageVisible.value = false
      resolve()
    }, duration)
  })
}

const getTypeMultiplier = (moveType, defenderTypes) => {
  const normalizedMoveType = normalizeType(moveType)
  let multiplier = 1
  const row = typeChart[normalizedMoveType] || {}

  defenderTypes.forEach((defenderType) => {
    const normalizedDefenderType = normalizeType(defenderType)
    if (row[normalizedDefenderType] != null) {
      multiplier *= row[normalizedDefenderType]
    }
  })

  return multiplier
}

const calculateDamage = (attacker, defender, move) => {
  const accuracy = move.accuracy ?? 100
  const roll = Math.random() * 100

  if (roll > accuracy) {
    return { hit: false, damage: 0, effectiveness: 0 }
  }

  let damage = (move.power ?? 60) * (attacker.attack / 50)

  if (attacker.types.some((type) => normalizeType(type) === normalizeType(move.type))) {
    damage *= 1.5
  }

  const effectiveness = getTypeMultiplier(move.type, defender.types)
  damage *= effectiveness

  let defenseMultiplier = (100 - defender.defense) / 100
  defenseMultiplier = Math.max(defenseMultiplier, 0.1)
  damage *= defenseMultiplier

  return {
    hit: true,
    damage: Math.max(1, Math.round(damage)),
    effectiveness
  }
}

const performAttack = async (attackerIndex, move) => {
  if (isBattleOver.value || attackerIndex !== activeAttackerIndex.value) {
    return
  }

  const defenderIndex = attackerIndex === 0 ? 1 : 0
  const attacker = pokedex.value[attackerIndex]
  const defender = pokedex.value[defenderIndex]

  if (!attacker || !defender) {
    return
  }

  const result = calculateDamage(attacker, defender, move)

  if (!result.hit) {
    activeAttackerIndex.value = defenderIndex
    await showBattleMessage(`${attacker.name} falló el ataque ${move.name}!`)
    return
  }

  defender.hp = Math.max(0, defender.hp - result.damage)

  await showBattleMessage(
    `${attacker.name} uses ${move.name} and deals ${result.damage} damage. Effectiveness x${result.effectiveness}`
  )

  if (defender.hp === 0) {
    isBattleOver.value = true
    await showBattleMessage(`${defender.name} has been defeated!`)
    await showBattleMessage('The battle is over!')
    await router.push({ name: 'characterselection' })
    return
  }

  activeAttackerIndex.value = defenderIndex
}

const canUseMoves = (index) => !isBattleOver.value && index === activeAttackerIndex.value

const initFight = async () => {
  const selected = selectionState.selectedPokemons

  if (!selected || selected.length !== 2) {
    await router.push({ name: 'characterselection' })
    return
  }

  const normalized = selected.map((pokemon) => ({
    id: pokemon.id,
    name: pokemon.name,
    types: splitByComma(pokemon.types),
    sprite: pokemon.sprite,
    attack: Number(pokemon.attack ?? 0),
    defense: Number(pokemon.defense ?? pokemon.defese ?? 0),
    hp: Number(pokemon.hp ?? 0),
    speed: Number(pokemon.speed ?? 0),
    moves: buildMoves(pokemon.moves)
  }))

  pokedex.value = normalized
  activeAttackerIndex.value = normalized[0].speed >= normalized[1].speed ? 0 : 1
  isLoading.value = false
}

const pokemonPositionClass = (index) => (index === 0 ? 'pokemon-bottom-left' : 'pokemon-top-right')

onMounted(initFight)
</script>

<template>
  <main class="body-fight">
    <div v-if="isLoading" class="loading">Preparing fight...</div>

    <div v-else id="fight" class="fight">
      <div id="battle-message" class="battle-message" :class="{ visible: isMessageVisible }">
        {{ battleMessage }}
      </div>

      <div
        v-for="(pokemon, index) in pokedex"
        :key="`${pokemon.id}-${index}`"
        class="pokemon-fight"
        :class="pokemonPositionClass(index)"
      >
        <CharacterCard
          :pokemon="pokemon"
          :show-moves-button="false"
          :show-select-button="false"
        />

        <div class="pokemon-moves-list" :class="{ hidden: !canUseMoves(index) }">
          <h4>Pick a move:</h4>
          <ul class="moves-list">
            <li v-for="move in pokemon.moves" :key="`${pokemon.id}-${move.id}`">
              <button
                type="button"
                class="move-button"
                @click="performAttack(index, move)"
              >
                {{ move.name }} (Type: {{ move.type }}, Pow: {{ move.power }}, Acc: {{ move.accuracy }})
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:global(:root) {
  --type-normal-color: linear-gradient(135deg, #E4E4B8, #8A8A3A);
  --type-fire-color: linear-gradient(135deg, #FFD0A0, #C44A00);
  --type-water-color: linear-gradient(135deg, #B8D4FF, #274B9F);
  --type-electric-color: linear-gradient(135deg, #FFF6A0, #C79B00);
  --type-grass-color: linear-gradient(135deg, #C6F7A0, #417A1F);
  --type-ice-color: linear-gradient(135deg, #E4FFFD, #3D9F96);
  --type-fighting-color: linear-gradient(135deg, #FF8A7F, #7A130F);
  --type-poison-color: linear-gradient(135deg, #E9A4EC, #5C1C5A);
  --type-ground-color: linear-gradient(135deg, #FFE7AE, #9A7423);
  --type-flying-color: linear-gradient(135deg, #E4D6FF, #5531B3);
  --type-psychic-color: linear-gradient(135deg, #FFC0D8, #B0003D);
  --type-bug-color: linear-gradient(135deg, #E0F57A, #5E6E00);
  --type-rock-color: linear-gradient(135deg, #F0E38C, #6A5610);
  --type-ghost-color: linear-gradient(135deg, #C4A4F0, #3A214F);
  --type-dragon-color: linear-gradient(135deg, #C2A1FF, #2E0C9E);
  --type-dark-color: linear-gradient(135deg, #C79B7A, #4c3122);
  --type-steel-color: linear-gradient(135deg, #F4F4FF, #4E4E6A);
  --type-fairy-color: linear-gradient(135deg, #FFD2E8, #8A2556);
}

.body-fight {
  font-family: Arial, Helvetica, sans-serif;
  font-size: small;
  background: #f4f4f9;
  margin: 0;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: 0;
}

.loading {
  margin-top: 2rem;
}

.fight {
  position: relative;
  margin: 40px 120px;
  width: calc(100vw - 240px);
  height: calc(100vh - 80px);
  background-image: url('/background.jpg');
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
  border: 10px solid #111111;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.pokemon {
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 263px;
  align-items: center;
  gap: 10px;
  background: transparent;
}

.pokemon-fight {
  position: absolute;
  display: flex;
  gap: 10px;
  width: fit-content;
  padding: 20px;
}

.pokemon-bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-start;
}

.pokemon-top-right {
  top: 0;
  right: 0;
  flex-direction: row-reverse;
  align-items: flex-start;
  justify-content: flex-end;
}

.move-button {
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: #f7f7ff;
  text-align: left;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.move-button:hover {
  background: #fff3c8;
  cursor: pointer;
}

.move-button:active {
  transform: translateY(2px);
}

.pokemon-moves-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 3px solid #FCD64D;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.18);
}

.pokemon-moves-list.hidden {
  display: none;
}

.pokemon-moves-list h4 {
  font-weight: bold;
  font-size: medium;
}

.moves-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.battle-message {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-width: 60%;
  padding: 16px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 3px solid #FCD64D;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.battle-message.visible {
  opacity: 1;
  pointer-events: auto;
}
</style>