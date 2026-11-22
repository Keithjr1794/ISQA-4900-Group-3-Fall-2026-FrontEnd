
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../store/AuthStore.js'

import Home from '../components/Home.vue'
import RestaurantList from '../components/RestaurantList.vue'
import MyPlaces from '../components/MyPlaces.vue'
import Auth from '../components/Auth.vue'
import Register from '../components/Register.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import AdminRestaurants from '../components/AdminRestaurants.vue'
import AdminCategories from '../components/AdminCategories.vue'
import AdminReviews from '../components/AdminReviews.vue'

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
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/restaurants',
    name: 'AdminRestaurants',
    component: AdminRestaurants,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: AdminReviews,
    meta: { requiresAuth: true, requiresAdmin: true },
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

  if (to.meta.requiresAdmin && !authStore.user?.is_staff) {
    return { name: 'Home' }
  }
})

export default router
