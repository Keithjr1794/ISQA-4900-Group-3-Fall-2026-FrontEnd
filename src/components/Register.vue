<template>
  <section class="register-page">
    <div class="register-card">
      <h1>Register</h1>
      <p>Create an account for Rate My Restaurant.</p>

      <div v-if="errors.length" class="error" role="alert">
        <ul>
          <li v-for="(message, index) in errors" :key="index">
            {{ message }}
          </li>
        </ul>
      </div>

      <div v-if="success" role="status">
        <p class="success">
          Account created successfully!
        </p>

        <router-link to="/login">Go to Login</router-link>
      </div>

      <form v-else @submit.prevent="register">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="credentials.username"
          type="text"
          autocomplete="username"
          maxlength="150"
          required
        />

        <label for="email">Email</label>
        <input
          id="email"
          v-model="credentials.email"
          type="email"
          autocomplete="email"
          required
        />

        <label for="first-name">First Name</label>
        <input
          id="first-name"
          v-model="credentials.first_name"
          type="text"
          autocomplete="given-name"
          maxlength="150"
        />

        <label for="last-name">Last Name</label>
        <input
          id="last-name"
          v-model="credentials.last_name"
          type="text"
          autocomplete="family-name"
          maxlength="150"
        />

        <label for="password">Password</label>
        <input
          id="password"
          v-model="credentials.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          required
        />

        <label for="password2">Confirm Password</label>
        <input
          id="password2"
          v-model="credentials.password2"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          required
        />

        <label class="password-option">
          <input v-model="showPassword" type="checkbox" />
          Show password
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

        <router-link to="/login">
          Back to Login
        </router-link>
      </form>
    </div>
  </section>
</template>

<script>
import APIService from '../api/APIService.js'

export default {
  name: 'Register',

  data: () => ({
    credentials: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
    },
    showPassword: false,
    loading: false,
    errors: [],
    success: false,
  }),

  methods: {
    async register() {
      this.errors = []

      if (this.credentials.password !== this.credentials.password2) {
        this.errors = ['Passwords do not match.']
        return
      }

      this.loading = true

      try {
        await APIService.registerUser({
          ...this.credentials,
          username: this.credentials.username.trim(),
          email: this.credentials.email.trim(),
          first_name: this.credentials.first_name.trim(),
          last_name: this.credentials.last_name.trim(),
        })

        this.credentials.password = ''
        this.credentials.password2 = ''
        this.success = true
      } catch (error) {
        const data = error.response?.data

        if (data && typeof data === 'object') {
          this.errors = Object.entries(data).flatMap(
            ([field, messages]) => {
              const values = Array.isArray(messages)
                ? messages
                : [messages]

              return values.map((message) =>
                field === 'detail' || field === 'non_field_errors'
                  ? String(message)
                  : `${field}: ${message}`
              )
            }
          )
        } else {
          this.errors = [
            'Unable to register. Check the backend connection.',
          ]
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.register-page {
  padding: 60px 24px;
}

.register-card {
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
  border: none;
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

a {
  color: #71372e;
  font-weight: bold;
}

.error {
  padding: 12px;
  background: #fcebea;
  color: #8c2222;
  border-radius: 5px;
}

.error ul {
  margin: 0;
  padding-left: 20px;
}

.success {
  padding: 12px;
  background: #eaf4e9;
  color: #28572b;
  border-radius: 5px;
}
</style>