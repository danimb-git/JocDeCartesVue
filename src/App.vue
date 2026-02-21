<script setup>
import { computed } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useRoute } from "vue-router";
import { selectionState } from "./selectionState";

const route = useRoute();

const canOpenFightArena = computed(() => {
  return route.name === "characterselection" && selectionState.selectedCount === 2;
});
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/charactercreation">Character creation</RouterLink>
      <RouterLink to="/">Character selection</RouterLink>
      <RouterLink v-if="canOpenFightArena" to="/fightarena">Fight arena</RouterLink>
      <span v-else class="disabled-link">Fight arena</span>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  width: 100%;
  background-color: #1f2937;
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

nav {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
  margin-top: 0;
}

nav a.router-link-exact-active {
  color: #ffffff;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  color: #ffffff;
  text-decoration: none;
  padding: 0;
}

.disabled-link {
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
