import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const RETOOL_API_URL = 'https://retoolapi.dev/LaiHmW/data'
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon'
const POKEAPI_SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species?limit=1'
const POKEMON_TO_INSERT = 8
const MOVES_PER_POKEMON = 4

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const getStat = (stats, statName) => {
  return stats.find((entry) => entry.stat.name === statName)?.base_stat ?? null
}

const shuffle = (array) => {
  const copy = [...array]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = copy[index]
    copy[index] = copy[randomIndex]
    copy[randomIndex] = temp
  }

  return copy
}

const pickRandomMoves = (movesCatalog, count) => {
  return shuffle(movesCatalog).slice(0, count)
}

const getRandomPokemonIds = (count, maxPokemonId) => {
  const ids = new Set()

  while (ids.size < count) {
    const randomId = Math.floor(Math.random() * maxPokemonId) + 1
    ids.add(randomId)
  }

  return Array.from(ids)
}

const loadMovesCatalog = async () => {
  const movesPath = resolve(process.cwd(), 'src/data/moves.json')
  const raw = await readFile(movesPath, 'utf-8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed) || parsed.length < MOVES_PER_POKEMON) {
    throw new Error('moves.json must contain at least 4 moves.')
  }

  return parsed
}

const deleteSampleRecord = async () => {
  const response = await fetch(`${RETOOL_API_URL}/1`, { method: 'DELETE' })

  if (response.ok) {
    console.log('Deleted sample record with id=1')
    return
  }

  if (response.status === 404) {
    console.log('Sample record id=1 not found (already deleted)')
    return
  }

  const body = await response.text()
  throw new Error(`Failed deleting id=1. Status ${response.status}. Body: ${body}`)
}

const mapPokemonToRetoolPayload = (pokemonData, randomMoves) => {
  return {
    name: capitalize(pokemonData.name),
    types: pokemonData.types.map((entry) => capitalize(entry.type.name)).join(', '),
    sprite: pokemonData.sprites.front_default,
    attack: getStat(pokemonData.stats, 'attack'),
    defense: getStat(pokemonData.stats, 'defense'),
    hp: getStat(pokemonData.stats, 'hp'),
    speed: getStat(pokemonData.stats, 'speed'),
    moves: randomMoves.map((move) => move.name).join(', ')
  }
}

const fetchPokemonFromPokeApi = async (pokemonId) => {
  const response = await fetch(`${POKEAPI_BASE_URL}/${pokemonId}`)

  if (!response.ok) {
    throw new Error(`PokeAPI error for id=${pokemonId}. Status ${response.status}`)
  }

  return response.json()
}

const fetchTotalPokemonCount = async () => {
  const response = await fetch(POKEAPI_SPECIES_URL)

  if (!response.ok) {
    throw new Error(`PokeAPI species count request failed. Status ${response.status}`)
  }

  const data = await response.json()
  const totalCount = Number(data.count)

  if (!Number.isFinite(totalCount) || totalCount < POKEMON_TO_INSERT) {
    throw new Error('Invalid total pokemon count received from PokeAPI.')
  }

  return totalCount
}

const insertPokemonInRetool = async (payload) => {
  const response = await fetch(RETOOL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Retool POST failed. Status ${response.status}. Body: ${body}`)
  }

  return response.json()
}

const main = async () => {
  console.log('Loading moves from src/data/moves.json...')
  const movesCatalog = await loadMovesCatalog()

  console.log('Fetching total pokemon count from PokeAPI...')
  const totalPokemonCount = await fetchTotalPokemonCount()
  const randomPokemonIds = getRandomPokemonIds(POKEMON_TO_INSERT, totalPokemonCount)

  console.log(`Seeding ${POKEMON_TO_INSERT} random pokemons from 1-${totalPokemonCount}...`)
  let successCount = 0

  for (const pokemonId of randomPokemonIds) {
    try {
      const pokemonData = await fetchPokemonFromPokeApi(pokemonId)
      const randomMoves = pickRandomMoves(movesCatalog, MOVES_PER_POKEMON)
      const payload = mapPokemonToRetoolPayload(pokemonData, randomMoves)

      await insertPokemonInRetool(payload)
      successCount += 1

      console.log(`[${pokemonId}] Inserted ${payload.name}`)
    } catch (error) {
      console.error(`[${pokemonId}] Failed:`, error.message)
    }
  }

  console.log(`Inserted ${successCount}/${POKEMON_TO_INSERT} pokemons.`)

  console.log('Deleting Retool sample record (id=1)...')
  await deleteSampleRecord()

  console.log('Done.')
}

main().catch((error) => {
  console.error('Fatal error running seed script:', error)
  process.exitCode = 1
})
