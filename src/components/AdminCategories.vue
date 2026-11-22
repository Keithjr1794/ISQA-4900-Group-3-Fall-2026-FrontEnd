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
          <h1>Manage Categories</h1>
          <p>Add and edit restaurant categories</p>
        </div>

        <span class="admin-badge">Administrator</span>
      </header>

      <!-- Feedback Messages -->
      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <p v-if="success" class="success" role="status">
        {{ success }}
      </p>

      <!-- Add / Edit Category Form -->
      <section class="category-card">
        <h2>
          {{ editingId === null ? 'Add New Category' : 'Edit Category' }}
        </h2>

        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label for="category-name">Category Name</label>

            <input
              id="category-name"
              v-model.trim="categoryName"
              type="text"
              placeholder="Enter category name"
              maxlength="100"
              required
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="saving || !categoryName.trim()"
            >
              {{
                saving
                  ? 'Saving...'
                  : editingId === null
                    ? '+ Add Category'
                    : 'Save Changes'
              }}
            </button>

            <button
              v-if="editingId !== null"
              type="button"
              class="cancel-button"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <!-- Existing Categories -->
      <section class="category-card">
        <h2>Existing Categories</h2>

        <p v-if="loading" class="empty-message">
          Loading categories...
        </p>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="category in categories"
                :key="category.id"
              >
                <td>{{ category.name }}</td>

                <td>
                  <button
                    type="button"
                    class="edit-button"
                    @click="editCategory(category)"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              <tr v-if="categories.length === 0">
                <td colspan="2" class="empty-message">
                  No categories found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<script>
import APIService from '../api/APIService.js'

export default {
  name: 'AdminCategories',

  data() {
    return {
      categories: [],
      categoryName: '',
      editingId: null,
      loading: false,
      saving: false,
      error: '',
      success: '',
    }
  },

  mounted() {
    this.loadCategories()
  },

  methods: {
    async loadCategories() {
      this.loading = true
      this.error = ''

      try {
        const response = await APIService.getCategories()
        const data = response.data

        this.categories = Array.isArray(data)
          ? data
          : data.results || []
      } catch {
        this.error = 'Unable to load categories.'
      } finally {
        this.loading = false
      }
    },

    editCategory(category) {
      this.editingId = category.id
      this.categoryName = category.name
      this.error = ''
      this.success = ''
    },

    cancelEdit() {
      this.editingId = null
      this.categoryName = ''
    },

    async saveCategory() {
      if (!this.categoryName.trim() || this.saving) {
        return
      }

      this.saving = true
      this.error = ''
      this.success = ''

      const category = {
        name: this.categoryName.trim(),
      }

      try {
        if (this.editingId === null) {
          await APIService.addCategory(category)
          this.success = 'Category created successfully!'
        } else {
          await APIService.updateCategory(
            this.editingId,
            category
          )
          this.success = 'Category updated successfully!'
        }

        this.cancelEdit()
        await this.loadCategories()
      } catch (err) {
        const details = err.response?.data

        this.error = details
          ? JSON.stringify(details)
          : 'Unable to save category.'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
/* Main Admin Layout */
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

/* Category Cards */
.category-card {
  background: white;
  padding: 30px;
  border-radius: 14px;
  margin-bottom: 30px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.category-card h2 {
  color: #71372e;
  font-size: 24px;
  margin-bottom: 25px;
}

/* Forms */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-group label {
  font-weight: bold;
  color: #71372e;
}

.form-group input {
  padding: 12px;
  border: 1px solid #d9c3b7;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.cancel-button {
  background: #777;
}

/* Category Table */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f0e1dc;
  color: #71372e;
}

.edit-button {
  background: #71372e;
}

.empty-message {
  color: #777;
  text-align: center;
  padding: 20px;
}

/* Messages */
.error {
  color: #b91c1c;
  margin-bottom: 20px;
}

.success {
  color: #15803d;
  margin-bottom: 20px;
}

/* Responsive Layout */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
