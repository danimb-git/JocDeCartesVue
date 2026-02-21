<script setup>
import { computed } from "vue";

const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  cardKey: {
    type: String,
    default: "",
  },
  showMovesButton: {
    type: Boolean,
    default: true,
  },
  showSelectButton: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["toggle-select"]);

const splitByComma = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const types = computed(() => splitByComma(props.pokemon.types));
const moves = computed(() => splitByComma(props.pokemon.moves));

const primaryType = computed(() => {
  return (types.value[0] ?? "normal").toLowerCase();
});

const cardStyle = computed(() => ({
  backgroundImage: `var(--type-${primaryType.value}-color, var(--type-normal-color))`,
}));

const defense = computed(
  () => props.pokemon.defense ?? props.pokemon.defese ?? "-",
);

const toggleSelected = () => {
  if (!props.showSelectButton) {
    return;
  }

  emit("toggle-select", props.cardKey);
};

const showMovesAlert = () => {
  if (!moves.value.length) {
    alert("No moves");
    return;
  }

  alert(moves.value.join("\n"));
};
</script>

<template>
  <div class="pokemon">
    <div
      class="pokemon-card front"
      :class="{ selected: selected }"
      :style="cardStyle"
    >
      <div class="pokemon-nameHp">
        <p class="pokemon-name">{{ pokemon.name ?? "Unknown" }}</p>
        <p class="pokemon-hp">{{ pokemon.hp ?? "-" }} HP</p>
      </div>

      <div class="pokemon-divImage">
        <img
          :src="pokemon.sprite"
          :alt="pokemon.name ?? 'Pokemon'"
          class="pokemon-image"
        />
      </div>

      <p class="pokemon-types">
        Type(s): {{ types.length ? types.join(", ") : "Unknown" }}
      </p>

      <div class="pokemon-attackDefense">
        <p class="pokemon-attack">Attack: {{ pokemon.attack ?? "-" }}</p>
        <p class="pokemon-defense">Defense: {{ defense }}</p>
      </div>

      <p class="pokemon-speed">Speed: {{ pokemon.speed ?? "-" }}</p>

      <button
        v-if="showMovesButton"
        type="button"
        class="pokemon-moves-button"
        @click="showMovesAlert"
      >
        Move set
      </button>
    </div>

    <button
      v-if="showSelectButton"
      type="button"
      class="pokemon-select-button"
      @click="toggleSelected"
    >
      {{ selected ? "Deselect" : "Select" }}
    </button>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:global(:root) {
  --type-normal-color: linear-gradient(135deg, #e4e4b8, #8a8a3a);
  --type-fire-color: linear-gradient(135deg, #ffd0a0, #c44a00);
  --type-water-color: linear-gradient(135deg, #b8d4ff, #274b9f);
  --type-electric-color: linear-gradient(135deg, #fff6a0, #c79b00);
  --type-grass-color: linear-gradient(135deg, #c6f7a0, #417a1f);
  --type-ice-color: linear-gradient(135deg, #e4fffd, #3d9f96);
  --type-fighting-color: linear-gradient(135deg, #ff8a7f, #7a130f);
  --type-poison-color: linear-gradient(135deg, #e9a4ec, #5c1c5a);
  --type-ground-color: linear-gradient(135deg, #ffe7ae, #9a7423);
  --type-flying-color: linear-gradient(135deg, #e4d6ff, #5531b3);
  --type-psychic-color: linear-gradient(135deg, #ffc0d8, #b0003d);
  --type-bug-color: linear-gradient(135deg, #e0f57a, #5e6e00);
  --type-rock-color: linear-gradient(135deg, #f0e38c, #6a5610);
  --type-ghost-color: linear-gradient(135deg, #c4a4f0, #3a214f);
  --type-dragon-color: linear-gradient(135deg, #c2a1ff, #2e0c9e);
  --type-dark-color: linear-gradient(135deg, #c79b7a, #4c3122);
  --type-steel-color: linear-gradient(135deg, #f4f4ff, #4e4e6a);
  --type-fairy-color: linear-gradient(135deg, #ffd2e8, #8a2556);
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

.pokemon-card {
  display: flex;
  flex-direction: column;
  width: 263px;
  height: fit-content;
  min-height: 353px;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  padding-bottom: 15px;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 20px;
  border-color: #fcd64d;
  border-style: solid;
  border-width: 10px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.18);
}

.pokemon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.pokemon-card.selected {
  border-color: #05ff1e;
  box-shadow: 0 0 12px #05ff1e;
}

.pokemon-card.backside {
  background-image: url("../img/pokemon_card_backside.png");
  background-size: cover;
  background-position: center;
}

.pokemon-nameHp {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
  justify-content: space-between;
  font-weight: bold;
  font-size: medium;
}

.pokemon-divImage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: fit-content;
  border-color: #fcd64d;
  border-style: solid;
  border-width: 8px;
  background-color: rgba(252, 214, 77, 0.2);
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.pokemon-attackDefense {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: rgba(252, 214, 77, 0.8);
}

.pokemon-speed {
  font-style: italic;
}

.pokemon-moves-button {
  width: 100%;
  height: fit-content;
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(252, 214, 77, 0.9);
  border-color: rgb(255, 241, 189);
  border-style: solid;
  border-width: 2px;
}

.pokemon-moves-button:hover {
  background-color: #e6c849;
  cursor: pointer;
}

.pokemon-select-button {
  width: 100%;
  height: fit-content;
  padding: 10px;
  border-radius: 10px;
  background-color: #cbfaca;
  border-color: #8fb78e;
  border-style: solid;
  border-width: 5px;
  font-weight: bold;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.18);
}

.pokemon-select-button:hover {
  background-color: #99c598;
  cursor: pointer;
}

.pokemon-select-button:active,
.pokemon-moves-button:active {
  transform: translateY(2px);
}
</style>
