<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CharacterCard from '../components/CharacterCard.vue'
import { selectionState } from '../selectionState'

const API_URL = 'https://retoolapi.dev/LaiHmW/data'

const pokemons = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const selectedCardKeys = ref([])

const getPokemonKey = (pokemon, index) => `${pokemon.id ?? 'no-id'}-${index}`

const toggleCardSelection = (cardKey) => {
  const selectedIndex = selectedCardKeys.value.indexOf(cardKey)

  if (selectedIndex !== -1) {
    selectedCardKeys.value.splice(selectedIndex, 1)
    return
  }

  if (selectedCardKeys.value.length === 2) {
    selectedCardKeys.value.shift()
  }

  selectedCardKeys.value.push(cardKey)
}

const selectedCharacters = computed(() => {
  const selectedSet = new Set(selectedCardKeys.value)

  return pokemons.value
    .map((pokemon, index) => ({
      key: getPokemonKey(pokemon, index),
      name: pokemon.name ?? 'Unknown'
    }))
    .filter((entry) => selectedSet.has(entry.key))
})

watch(
  () => selectedCardKeys.value.length,
  (count) => {
    selectionState.selectedCount = count
  },
  { immediate: true }
)

const fetchPokemons = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    pokemons.value = Array.isArray(data) ? data : []
    selectedCardKeys.value = []
  } catch (error) {
    errorMessage.value = 'Could not load pokemons from API.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPokemons)

onUnmounted(() => {
  selectionState.selectedCount = 0
})
</script>

<template>
  <main class="character-selection">
    <h1>Character Selection</h1>

    <div class="selection-indicator">
      <p><strong>Selected:</strong> {{ selectedCardKeys.length }}/2</p>
      <p>
        <strong>Characters:</strong>
        {{ selectedCharacters.length ? selectedCharacters.map((character) => character.name).join(', ') : 'None' }}
      </p>
    </div>

    <p v-if="isLoading">Loading pokemons...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!pokemons.length">No pokemons found in API.</p>

    <section v-else class="pokedex">
      <CharacterCard
        v-for="(pokemon, index) in pokemons"
        :key="getPokemonKey(pokemon, index)"
        :card-key="getPokemonKey(pokemon, index)"
        :selected="selectedCardKeys.includes(getPokemonKey(pokemon, index))"
        :pokemon="pokemon"
        @toggle-select="toggleCardSelection"
      />
    </section>
  </main>
</template>

<style scoped>
.character-selection {
  font-family: Arial, Helvetica, sans-serif;
  font-size: small;
  background: #f4f4f9;
  min-height: 100%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.selection-indicator {
  padding: 10px 14px;
  border: 2px solid #fcd64d;
  border-radius: 12px;
  background: rgb(255 255 255 / 80%);
  box-shadow: 0 1px 10px rgb(0 0 0 / 12%);
}

.pokedex {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 26px;
  max-width: 1100px;
  margin: 0 auto;
}
</style>