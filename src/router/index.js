import { createRouter, createWebHistory } from 'vue-router'
import CharacterSelectionView from '../views/CharacterSelectionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'characterselection',
      component: CharacterSelectionView,
    },
    {
      path: '/charactercreation',
      name: 'charactercreation',
      component: () => import('../views/CharacterCreationView.vue'),
    },
    {
      path: '/fightarena',
      name: 'fightarena',
      component: () => import('../views/FightArenaView.vue'),
    },
  ],
})

export default router
