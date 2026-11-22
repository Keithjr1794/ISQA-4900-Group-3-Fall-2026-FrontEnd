
<template>
  <div class="admin-layout">
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

        <span class="sidebar-placeholder">
          Reviews
        </span>

        <span class="sidebar-placeholder">
          Users
        </span>
      </nav>
    </aside>

    <main class="content">
      <header>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your restaurant application</p>
        </div>

        <span class="admin-badge">Administrator</span>
      </header>

      <p v-if="loading">Loading dashboard...</p>

      <p v-else-if="error" class="error">
        {{ error }}
      </p>

      <div v-else class="stats-grid">
        <div class="stat-card">
          <p>Total Restaurants</p>
          <h2>{{ stats.total_restaurants }}</h2>
        </div>

        <div class="stat-card">
          <p>Total Categories</p>
          <h2>{{ stats.total_categories }}</h2>
        </div>

        <div class="stat-card">
          <p>Total Reviews</p>
          <h2>{{ stats.total_reviews }}</h2>
        </div>

        <div class="stat-card">
          <p>Total Users</p>
          <h2>{{ stats.total_users }}</h2>
        </div>
      </div>

      <section v-if="!loading && !error" class="welcome">
        <h2>Welcome to your dashboard</h2>
        <p>
          View your restaurant statistics and manage
          your application from one place.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  total_restaurants: 0,
  total_categories: 0,
  total_reviews: 0,
  total_users: 0,
})

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('access')

    const response = await fetch(
      'http://127.0.0.1:8000/api/admin/dashboard/',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Admin access required.')
      }

      throw new Error('Unable to load dashboard.')
    }

    stats.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

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
}

.sidebar h2 {
  font-size: 22px;
  margin-bottom: 10px;
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

.sidebar a,
.sidebar-placeholder {
  display: block;
  color: white;
  text-decoration: none;
  padding: 13px 15px;
  border-radius: 8px;
}

.sidebar-placeholder {
  cursor: default;
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

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

header h1 {
  color: #71372e;
  margin-bottom: 8px;
}

header p {
  color: #777;
}

.admin-badge {
  background: #f0e1dc;
  color: #71372e;
  padding: 10px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* Dashboard Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.stat-card p {
  color: #777;
  font-size: 14px;
}

.stat-card h2 {
  color: #71372e;
  font-size: 38px;
  margin-top: 15px;
}

/* Welcome Section */
.welcome {
  background: white;
  margin-top: 35px;
  padding: 30px;
  border-radius: 14px;
}

.welcome h2 {
  color: #71372e;
  margin-bottom: 12px;
}

.welcome p {
  color: #777;
}

/* Error Message */
.error {
  color: #b42318;
  background: #fff0ee;
  padding: 15px;
  border-radius: 8px;
}

/* Responsive Layout */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: auto;
  }

  .content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  header {
    flex-wrap: wrap;
    gap: 15px;
  }
}
</style>
