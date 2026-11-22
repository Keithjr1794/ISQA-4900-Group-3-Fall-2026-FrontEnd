<script setup>
import { onMounted, ref } from 'vue'
import APIService from '../api/APIService.js'

const users = ref([])
const loading = ref(true)
const loadError = ref('')
const savingUserId = ref(null)
const actionError = ref('')

async function loadUsers() {
  loading.value = true
  loadError.value = ''

  try {
    const { data } = await APIService.getAdminUsers()
    users.value = data
  } catch (error) {
    loadError.value =
      error.response?.data?.detail || 'Unable to load users.'
  } finally {
    loading.value = false
  }
}

async function changeStatus(user) {
  if (savingUserId.value !== null || user.is_staff || user.is_superuser) {
    return
  }

  const nextStatus = !user.is_active

  if (!nextStatus && !window.confirm(`Deactivate ${user.username}?`)) {
    return
  }

  actionError.value = ''
  savingUserId.value = user.id

  try {
    const { data } = await APIService.updateAdminUserStatus(user.id, nextStatus)
    user.is_active = data.is_active
  } catch (error) {
    actionError.value =
      error.response?.data?.detail || `Unable to update ${user.username}.`
  } finally {
    savingUserId.value = null
  }
}

onMounted(loadUsers)
</script>

<template>
  <section class="users-page">
    <h1>Users</h1>

    <p v-if="loading" role="status">Loading users…</p>

    <div v-else-if="loadError">
      <p role="alert">{{ loadError }}</p>
      <button type="button" @click="loadUsers">Try again</button>
    </div>

    <p v-else-if="users.length === 0">No registered users.</p>

    <template v-else>
      <p v-if="actionError" role="alert">{{ actionError }}</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email || '—' }}</td>
              <td>{{ user.is_active ? 'Active' : 'Inactive' }}</td>
              <td>
                <span v-if="user.is_staff || user.is_superuser">
                  Admin account
                </span>
                <button
                  v-else
                  type="button"
                  :disabled="savingUserId !== null"
                  @click="changeStatus(user)"
                >
                  {{
                    savingUserId === user.id
                      ? 'Saving…'
                      : user.is_active ? 'Deactivate' : 'Activate'
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.users-page {
  max-width: 70rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  border-bottom: 1px solid #8885;
  text-align: left;
}

button {
  padding: 0.4rem 0.75rem;
}
</style>
