import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import SettingsView from '../views/Settings.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/settings', component: SettingsView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})