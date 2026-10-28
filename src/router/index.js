import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/AuthStore.js'

import Home from '../components/Home.vue'
import RestaurantList from '../components/RestaurantList.vue'
import MyPlaces from '../components/MyPlaces.vue'
import Auth from '../components/Auth.vue'
import Register from '../components/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/restaurants',
    name: 'RestaurantList',
    component: RestaurantList,
    meta: { requiresAuth: true },
  },
  {
  path: '/restaurants/:id',
  name: 'RestaurantDetail',
  component: RestaurantList,
  meta: { requiresAuth: true },
},
  {
    path: '/my-places',
    name: 'MyPlaces',
    component: MyPlaces,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    alias: '/auth',
    name: 'Auth',
    component: Auth,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Auth' }
  }
})

export default router