
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

          <!-- Admin Panel -->
          <li
            v-if="
              authStore.isAuthenticated &&
              authStore.user?.is_superuser
            "
          >
            <router-link
              to="/admin/dashboard"
              :class="{ 'admin-active': $route.path.startsWith('/admin') }"
              @click="closeMenu"
            >
              Admin Panel
            </router-link>
          </li>

          <li v-if="!authStore.isAuthenticated">
            <router-link to="/login" @click="closeMenu">
              Login
            </router-link>
          </li>

          <li v-else class="user-menu">
            <span>Hi, {{ authStore.user?.username || 'User' }}</span>

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

    <!-- Keep admin pages in memory for faster navigation -->
    <main>
      <router-view v-slot="{ Component }">
        <KeepAlive :include="['AdminDashboard', 'AdminRestaurants']">
          <component :is="Component" />
        </KeepAlive>
      </router-view>
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

/* Main Navigation */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 22px 6%;
  background: #71372e;
  border-bottom: 2px solid #bd8267;
  box-shadow: 0 3px 12px rgba(80, 35, 35, 0.12);
}

.brand {
  color: #fff8f1;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-decoration: none;
}

.brand:hover {
  color: #f2d6c8;
}

.nav-items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-items a {
  display: inline-block;
  padding: 10px 15px;
  color: #fff8f1;
  font-weight: 600;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s, color 0.2s;
}

.nav-items a:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* Active navigation links */
.nav-items a.router-link-exact-active {
  background: #fff1e8;
  color: #71372e;
}

/* Keep Admin Panel highlighted on all admin pages */
.nav-items a.admin-active {
  background: #fff1e8;
  color: #71372e;
  font-weight: bold;
}

.nav-items a.admin-active:hover {
  background: #f2d6c8;
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.user-menu span {
  color: #fff8f1;
  font-weight: 600;
}

.logout-button,
.menu-toggle {
  padding: 9px 14px;
  background: transparent;
  border: 1px solid #f7eee3;
  border-radius: 9px;
  color: #f7eee3;
  font: inherit;
  cursor: pointer;
}

.logout-button:hover,
.menu-toggle:hover {
  background: #582a23;
}

.menu-toggle {
  display: none;
}

.site-header a:focus-visible,
.site-header button:focus-visible {
  outline: 2px solid #fff8f1;
  outline-offset: 4px;
}

.app > main {
  flex: 1;
}

/* Mobile Navigation */
@media screen and (max-width: 768px) {
  .site-header {
    gap: 16px;
    padding: 18px 20px;
  }

  .brand {
    font-size: 21px;
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
    align-items: stretch;
    gap: 8px;
    padding-top: 12px;
  }

  .nav-items a {
    display: block;
  }

  .user-menu {
    padding: 10px 15px;
  }
}
</style>
