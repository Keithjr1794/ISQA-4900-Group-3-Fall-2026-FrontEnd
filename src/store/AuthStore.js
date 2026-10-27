import { defineStore } from 'pinia'
import APIService from '../api/APIService.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    access: null,
    refresh: null,
  }),

  actions: {
    setAuth({ user, access, refresh }) {
      this.isAuthenticated = true
      this.user = user
      this.access = access
      this.refresh = refresh

      // APIService reads the access token from localStorage.
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
    },

    clearAuth() {
      this.isAuthenticated = false
      this.user = null
      this.access = null
      this.refresh = null

      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    },

    async login(credentials) {
      const response = await APIService.authenticateLogin(credentials)
      const { access, refresh } = response.data

      // Save the token before requesting the user's information.
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)

      try {
        const userResponse = await APIService.getCurrentUser()

        this.setAuth({
          user: userResponse.data,
          access,
          refresh,
        })
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async restoreLogin() {
      const access = localStorage.getItem('access')
      const refresh = localStorage.getItem('refresh')

      if (!access || !refresh) {
        this.clearAuth()
        return
      }

      try {
        const response = await APIService.getCurrentUser()

        this.setAuth({
          user: response.data,
          access,
          refresh,
        })
      } catch {
        this.clearAuth()
      }
    },

    logout() {
      this.clearAuth()
    },
  },
})