import { createRouter, createWebHistory } from 'vue-router'
import PluginStore from '../views/PluginStore.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PluginStore,
    },
  ],
})

export default router
