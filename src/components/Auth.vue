<template>
  <section class="auth-page">
    <div class="auth-card">
      <h1>Login</h1>
      <p>Log in or create an account to browse restaurants.</p>

      <div
        v-if="showMsg === 'loginError'"
        class="error"
        role="alert"
      >
        Invalid username or password. Please try again.
      </div>

      <div
        v-else-if="showMsg === 'axiosError'"
        class="error"
        role="alert"
      >
        Unable to log in. Check the backend connection.
      </div>

      <form @submit.prevent="login">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="credentials.username"
          type="text"
          maxlength="150"
          autocomplete="username"
          placeholder="Enter your username"
          required
        />

        <label for="password">Password</label>
        <input
          id="password"
          v-model="credentials.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Enter your password"
          required
        />

        <label class="password-option">
          <input v-model="showPassword" type="checkbox" />
          Show password
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <div class="register-section">
        <p>Don't have an account?</p>

        <router-link
          :to="{ name: 'Register' }"
          class="register-button"
        >
          Create an Account
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { useAuthStore } from '../store/AuthStore.js'

export default {
  name: 'Auth',

  data: () => ({
    credentials: {
      username: '',
      password: '',
    },
    showMsg: '',
    loading: false,
    showPassword: false,
  }),

  computed: {
    authStore() {
      return useAuthStore()
    },
  },

  methods: {
    async login() {
      this.showMsg = ''
      this.loading = true
      this.authStore.clearAuth()

      try {
        await this.authStore.login({
          username: this.credentials.username.trim(),
          password: this.credentials.password,
        })

        this.$router.push('/restaurants')
      } catch (error) {
        this.authStore.clearAuth()

        if (
          error.response?.status === 400 ||
          error.response?.status === 401
        ) {
          this.showMsg = 'loginError'
        } else {
          this.showMsg = 'axiosError'
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-page {
  padding: 60px 24px;
}

.auth-card {
  max-width: 440px;
  margin: auto;
  padding: 32px;
  background: white;
  border: 1px solid #d9c3b2;
  border-radius: 10px;
}

h1 {
  margin-top: 0;
  color: #71372e;
}

p {
  color: #735c50;
  line-height: 1.6;
}

form {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

label {
  color: #512b25;
  font-weight: bold;
}

input:not([type="checkbox"]) {
  width: 100%;
  padding: 12px;
  border: 1px solid #bda99b;
  border-radius: 5px;
  font: inherit;
}

.password-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: normal;
}

button {
  margin-top: 12px;
  padding: 12px;
  background: #71372e;
  color: #f7eee3;
  border: 1px solid #71372e;
  border-radius: 5px;
  font: inherit;
  cursor: pointer;
}

button:hover {
  background: #582a23;
}

button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.register-section {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5d8cc;
  text-align: center;
}

.register-section p {
  margin: 0 0 16px;
}

.register-button {
  display: block;
  padding: 12px;
  color: #71372e;
  background: white;
  border: 1px solid #71372e;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
}

.register-button:hover {
  background: #faf5ef;
}

.error {
  padding: 12px;
  background: #fcebea;
  color: #8c2222;
  border-radius: 5px;
}
</style>