<template>
  <div class="app">
    <header class="site-header">
      <router-link to="/" class="brand" @click="closeMenu">
        Rate My Restaurant
      </router-link>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="showMobileMenu"
        aria-controls="main-navigation"
        @click="toggleMenu"
      >
        {{ showMobileMenu ? 'Close ✕' : 'Menu ☰' }}
      </button>

      <nav
        id="main-navigation"
        class="navigation"
        :class="{ 'is-open': showMobileMenu }"
        aria-label="Main navigation"
      >
        <ul class="nav-items">
          <li>
            <router-link to="/" @click="closeMenu">
              Home
            </router-link>
          </li>

          <li>
            <router-link to="/restaurants" @click="closeMenu">
              Restaurants
            </router-link>
          </li>

          <li>
            <router-link to="/my-places" @click="closeMenu">
              My Places
            </router-link>
          </li>

          <li v-if="!authStore.isAuthenticated">
            <router-link to="/login" @click="closeMenu">
              Login
            </router-link>
          </li>

          <li v-else class="user-menu">
            <span>Hi, {{ authStore.user.username }}</span>

            <button
              class="logout-button"
              type="button"
              @click="logout"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

  
  </div>
</template>

<script>
import { useAuthStore } from './store/AuthStore.js'

export default {
  name: 'App',

  data() {
    return {
      showMobileMenu: false,
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    },
  },

  methods: {
    toggleMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },

    closeMenu() {
      this.showMobileMenu = false
    },

    logout() {
      this.authStore.clearAuth()
      this.closeMenu()
      this.$router.push('/')
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #faf5ef;
  color: #512b25;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 24px 6%;
  background: #71372e;
  border-bottom: 3px solid #bd8267;
}

.brand {
  color: #f7eee3;
  font-size: 22px;
  font-weight: bold;
  text-decoration: none;
}

.nav-items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-items a,
.nav-items span {
  display: inline-block;
  padding: 6px 0;
  color: #f7eee3;
  font-weight: bold;
  text-decoration: none;
}

.nav-items a:hover,
.nav-items a.router-link-exact-active {
  text-decoration: underline;
  text-underline-offset: 6px;
}

.user-menu {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.logout-button,
.menu-toggle {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #f7eee3;
  border-radius: 5px;
  color: #f7eee3;
  font: inherit;
  cursor: pointer;
}

.logout-button:hover {
  background: #582a23;
}

.menu-toggle {
  display: none;
}

.site-header a:focus-visible,
.site-header button:focus-visible {
  outline: 2px solid #f7eee3;
  outline-offset: 5px;
}

.app > main {
  flex: 1;
}

.app > footer {
  padding: 24px;
  background: #eee1d4;
  color: #633d32;
  border-top: 1px solid #d9c3b2;
  text-align: center;
  font-size: 14px;
}

@media screen and (max-width: 768px) {
  .site-header {
    gap: 16px;
    padding: 20px;
  }

  .brand {
    font-size: 20px;
  }

  .menu-toggle {
    display: block;
  }

  .navigation {
    display: none;
    width: 100%;
  }

  .navigation.is-open {
    display: block;
  }

  .nav-items {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-top: 12px;
  }
}
</style>