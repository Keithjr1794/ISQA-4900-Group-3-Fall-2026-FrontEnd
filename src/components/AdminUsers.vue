<script setup>
import { onMounted, ref } from 'vue'
import APIService from '../api/APIService.js'

const users = ref([])
const loading = ref(true)
const loadError = ref('')
const savingUserId = ref(null)
const actionError = ref('')
const success = ref('')

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
  success.value = ''
  savingUserId.value = user.id

  try {
    const { data } = await APIService.updateAdminUserStatus(
      user.id,
      nextStatus
    )

    user.is_active = data.is_active

    success.value = `${user.username} has been ${
      data.is_active ? 'activated' : 'deactivated'
    } successfully.`
  } catch (error) {
    actionError.value =
      error.response?.data?.detail ||
      `Unable to update ${user.username}.`
  } finally {
    savingUserId.value = null
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="admin-layout">

    <!-- Admin Sidebar -->
    <aside class="sidebar">
      <h2>Rate My Restaurant</h2>
      <p class="sidebar-label">ADMIN PANEL</p>

      <nav>
        <router-link to="/admin/dashboard">
          Dashboard
        </router-link>

        <router-link to="/admin/restaurants">
          Restaurants
        </router-link>

        <router-link to="/admin/categories">
          Categories
        </router-link>

        <router-link to="/admin/reviews">
          Reviews
        </router-link>

        <router-link to="/admin/users">
          Users
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="content">

      <header class="page-header">
        <div>
          <h1>Manage Users</h1>
          <p>View and manage registered user accounts</p>
        </div>

        <span class="admin-badge">Administrator</span>
      </header>

      <p v-if="actionError" class="error" role="alert">
        {{ actionError }}
      </p>

      <p v-if="success" class="success" role="status">
        {{ success }}
      </p>

      <section class="users-card">
        <h2>Registered Users</h2>

        <p v-if="loading" class="message" role="status">
          Loading users...
        </p>

        <div v-else-if="loadError">
          <p class="error" role="alert">
            {{ loadError }}
          </p>

          <button type="button" @click="loadUsers">
            Try Again
          </button>
        </div>

        <p v-else-if="users.length === 0" class="message">
          No registered users found.
        </p>

        <div v-else class="table-container">
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

                <td>{{ user.email || 'N/A' }}</td>

                <td>
                  <span
                    class="status-badge"
                    :class="user.is_active ? 'active' : 'inactive'"
                  >
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <td>
                  <span
                    v-if="user.is_staff || user.is_superuser"
                    class="admin-account"
                  >
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
                        ? 'Saving...'
                        : user.is_active
                          ? 'Deactivate'
                          : 'Activate'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #faf5ef;
  font-family: Arial, sans-serif;
}

/* Sidebar */

.sidebar {
  width: 250px;
  flex-shrink: 0;
  background: #71372e;
  color: white;
  padding: 30px 20px;
  box-sizing: border-box;
}

.sidebar h2 {
  font-size: 22px;
  margin-bottom: 10px;
  color: white;
}

.sidebar-label {
  font-size: 12px;
  letter-spacing: 2px;
  opacity: 0.7;
  margin-bottom: 35px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 13px 15px;
  border-radius: 8px;
}

.sidebar a:hover,
.sidebar a.router-link-exact-active {
  background: rgba(255, 255, 255, 0.18);
}

/* Main Content */

.content {
  flex: 1;
  min-width: 0;
  padding: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  gap: 15px;
}

.page-header h1 {
  color: #71372e;
  margin-bottom: 8px;
  font-size: 32px;
}

.page-header p {
  color: #777;
}

.admin-badge {
  background: #f0e1dc;
  color: #71372e;
  padding: 10px 16px;
  border-radius: 20px;
  font-weight: bold;
  white-space: nowrap;
}

/* Users Card */

.users-card {
  background: white;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.users-card h2 {
  color: #71372e;
  font-size: 24px;
  margin-bottom: 25px;
}

/* Table */

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f0e1dc;
  color: #71372e;
  font-weight: bold;
}

th,
td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

td {
  color: #71372e;
}

/* Buttons */

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #71372e;
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: 0.85;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status */

.status-badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
}

.status-badge.active {
  background: #e4f4e8;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.admin-account {
  color: #777;
  font-style: italic;
}

.error {
  color: #b91c1c;
  margin-bottom: 20px;
}

.success {
  color: #15803d;
  margin-bottom: 20px;
}

.message {
  color: #777;
}

/* Responsive */

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 20px;
  }

  .sidebar nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .content {
    padding: 20px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
