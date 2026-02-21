<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import movesCatalog from "../data/moves.json";

const MOVE_SLOT_COUNT = 4;
const API_URL = "https://retoolapi.dev/LaiHmW/data";
const router = useRouter();

const pokemonTypes = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

const pokemonForm = reactive({
  name: "",
  primaryType: "",
  secondaryType: "",
  sprite: "",
  attack: null,
  defense: null,
  hp: null,
  speed: null,
});

const moveSlots = ref(Array.from({ length: MOVE_SLOT_COUNT }, () => null));
const activeMoveSlotIndex = ref(null);

const secondaryTypeOptions = computed(() => {
  if (!pokemonForm.primaryType) {
    return pokemonTypes;
  }

  return pokemonTypes.filter((type) => type !== pokemonForm.primaryType);
});

const selectedMoves = computed(() => {
  return moveSlots.value
    .map((moveId) => movesCatalog.find((move) => move.id === moveId))
    .filter(Boolean);
});

const openMoveSelector = (slotIndex) => {
  activeMoveSlotIndex.value = slotIndex;
};

const setSlotMove = (slotIndex, moveIdValue) => {
  moveSlots.value[slotIndex] = moveIdValue ? Number(moveIdValue) : null;
  activeMoveSlotIndex.value = null;
};

const randomMoves = () => {
  const shuffledMoves = [...movesCatalog].sort(() => Math.random() - 0.5);
  const randomSelection = shuffledMoves.slice(0, MOVE_SLOT_COUNT);

  moveSlots.value = randomSelection.map((move) => move.id);
  activeMoveSlotIndex.value = null;
};

const createPokemon = async () => {
  const types = [pokemonForm.primaryType];

  if (pokemonForm.secondaryType) {
    types.push(pokemonForm.secondaryType);
  }

  const payload = {
    name: pokemonForm.name,
    types: types.join(", "),
    sprite: pokemonForm.sprite,
    attack: pokemonForm.attack,
    defense: pokemonForm.defense,
    hp: pokemonForm.hp,
    speed: pokemonForm.speed,
    moves: selectedMoves.value.map((move) => move.name).join(", "),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const createdPokemon = await response.json();
    console.log("Pokemon created in API:", createdPokemon);
    await router.push({ name: "characterselection" });
  } catch (error) {
    console.error("Error creating pokemon in API:", error);
  }
};
</script>

<template>
  <main class="character-creation">
    <h1>Create your Character</h1>

    <form class="pokemon-form" @submit.prevent="createPokemon">
      <label for="name">Name</label>
      <input
        id="name"
        v-model="pokemonForm.name"
        type="text"
        placeholder="Pikachu"
        required
      />

      <div class="types-row">
        <div class="type-field">
          <label for="primaryType">Type 1</label>
          <select
            id="primaryType"
            v-model="pokemonForm.primaryType"
            :class="{ 'select-placeholder': !pokemonForm.primaryType }"
            required
          >
            <option disabled hidden value="">Electric</option>
            <option v-for="type in pokemonTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="type-field">
          <label for="secondaryType">Type 2 (optional)</label>
          <select
            id="secondaryType"
            v-model="pokemonForm.secondaryType"
            :class="{ 'select-placeholder': !pokemonForm.secondaryType }"
          >
            <option value="">No second type</option>
            <option
              v-for="type in secondaryTypeOptions"
              :key="`secondary-${type}`"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <label for="sprite">Sprite</label>
      <input
        id="sprite"
        v-model="pokemonForm.sprite"
        type="url"
        placeholder="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
        required
      />

      <label for="attack">Attack</label>
      <input
        id="attack"
        v-model.number="pokemonForm.attack"
        type="number"
        min="1"
        placeholder="55"
        required
      />

      <label for="defense">Defense</label>
      <input
        id="defense"
        v-model.number="pokemonForm.defense"
        type="number"
        min="1"
        placeholder="40"
        required
      />

      <label for="hp">HP</label>
      <input
        id="hp"
        v-model.number="pokemonForm.hp"
        type="number"
        min="1"
        placeholder="35"
        required
      />

      <label for="speed">Speed</label>
      <input
        id="speed"
        v-model.number="pokemonForm.speed"
        type="number"
        min="1"
        placeholder="90"
        required
      />

      <div class="moves-header">
        <label>Moves</label>
        <button type="button" class="random-moves-button" @click="randomMoves">
          Random moves
        </button>
      </div>

      <div class="move-slots">
        <div
          v-for="(moveId, index) in moveSlots"
          :key="index"
          class="move-slot-item"
        >
          <button
            type="button"
            class="move-slot"
            :class="{ 'move-slot-placeholder': !moveId }"
            @click="openMoveSelector(index)"
          >
            {{
              moveId
                ? movesCatalog.find((move) => move.id === moveId)?.name
                : `Move slot ${index + 1}`
            }}
          </button>

          <select
            v-if="activeMoveSlotIndex === index"
            class="move-select"
            :value="moveId ?? ''"
            @change="setSlotMove(index, $event.target.value)"
          >
            <option value="">Select a move</option>
            <option
              v-for="move in movesCatalog"
              :key="move.id"
              :value="move.id"
            >
              {{ move.name }} ({{ move.type }})
            </option>
          </select>
        </div>
      </div>

      <button type="submit">Create Character</button>
    </form>
  </main>
</template>

<style scoped>
.character-creation {
  max-width: 560px;
  margin: 2rem auto;
  padding: 1rem;
}

.pokemon-form {
  display: grid;
  gap: 0.75rem;
}

.types-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.type-field {
  display: grid;
  gap: 0.35rem;
}

.moves-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.random-moves-button {
  width: auto;
}

.move-slots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.move-slot-item {
  display: grid;
  gap: 0.35rem;
}

.move-slot {
  text-align: left;
}

.move-slot-placeholder {
  color: rgb(117, 117, 117);
}

input,
select,
button {
  padding: 0.5rem;
  font: inherit;
}

button {
  cursor: pointer;
}

.select-placeholder {
  color: rgb(117, 117, 117);
}

.select-placeholder option {
  color: initial;
}
</style>
