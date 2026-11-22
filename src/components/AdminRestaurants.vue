
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

        <span class="sidebar-placeholder">
          Reviews
        </span>

        <span class="sidebar-placeholder">
          Users
        </span>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="content">

      <header class="page-header">
        <div>
          <h1>Manage Restaurants</h1>
          <p>Add, edit, and manage restaurant information</p>
        </div>

        <span class="admin-badge">Administrator</span>
      </header>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <div class="actions">
        <button type="button" @click="openAddForm">
          + Add Restaurant
        </button>
      </div>

      <!-- Add / Edit Restaurant Form -->
      <form
        v-if="showForm"
        class="restaurant-form"
        @submit.prevent="saveRestaurant"
      >
        <h3>
          {{ editingId !== null ? 'Edit Restaurant' : 'Add Restaurant' }}
        </h3>

        <div class="form-grid">

          <div class="form-group">
            <label for="restaurant-name">Restaurant Name</label>
            <input
              id="restaurant-name"
              v-model="form.name"
              placeholder="Enter restaurant name"
              required
            />
          </div>

          <div class="form-group">
            <label for="restaurant-category">Category</label>
            <select
              id="restaurant-category"
              v-model="form.category"
              required
            >
              <option value="" disabled>Select Category</option>

              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="restaurant-phone">Phone Number</label>
            <input
              id="restaurant-phone"
              v-model="form.phone_number"
              placeholder="Enter phone number"
            />
          </div>

          <div class="form-group">
            <label for="restaurant-address">Address</label>
            <input
              id="restaurant-address"
              v-model="form.address"
              placeholder="Street address"
              required
            />
          </div>

          <!-- State Dropdown -->
          <div class="form-group">
            <label for="restaurant-state">State</label>

            <select
              id="restaurant-state"
              v-model="form.state"
              @change="form.city = ''"
              required
            >
              <option value="" disabled>Select State</option>

              <option
                v-for="state in states"
                :key="state.isoCode"
                :value="state.name"
              >
                {{ state.name }}
              </option>
            </select>
          </div>

          <!-- City Dropdown -->
          <div class="form-group">
            <label for="restaurant-city">City</label>

            <select
              id="restaurant-city"
              v-model="form.city"
              :disabled="!form.state"
              required
            >
              <option value="" disabled>
                {{ form.state ? 'Select City' : 'Select State First' }}
              </option>

              <option
                v-for="city in cities"
                :key="city.name"
                :value="city.name"
              >
                {{ city.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="restaurant-zip">ZIP Code</label>
            <input
              id="restaurant-zip"
              v-model="form.zip_code"
              placeholder="ZIP Code"
              maxlength="10"
            />
          </div>

          <div class="form-group full-width">
            <label for="restaurant-description">Description</label>
            <textarea
              id="restaurant-description"
              v-model="form.description"
              placeholder="Restaurant description"
              rows="4"
            ></textarea>
          </div>

        </div>

        <div class="form-actions">
          <button type="submit" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Restaurant' }}
          </button>

          <button
            type="button"
            class="cancel-btn"
            @click="closeForm"
          >
            Cancel
          </button>
        </div>
      </form>

      <!-- Restaurant List -->
      <section class="restaurant-section">
        <h2>Restaurant List</h2>

        <p v-if="loading">Loading restaurants...</p>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>City</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="restaurant in restaurants"
                :key="restaurant.id"
              >
                <td>{{ restaurant.name }}</td>
                <td>{{ categoryName(restaurant.category) }}</td>
                <td>{{ restaurant.city }}</td>
                <td>{{ restaurant.state }}</td>

                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="edit-btn"
                      @click="editRestaurant(restaurant)"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-btn"
                      @click="removeRestaurant(restaurant)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="restaurants.length === 0">
                <td colspan="5" class="empty-message">
                  No restaurants found.
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
import { State, City } from 'country-state-city'

const emptyForm = () => ({
  name: '',
  category: '',
  phone_number: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  description: '',
})

export default {
  name: 'AdminRestaurants',

  data() {
    return {
      restaurants: [],
      categories: [],
      loading: false,
      saving: false,
      showForm: false,
      editingId: null,
      form: emptyForm(),
      error: '',
      success: '',
    }
  },

  computed: {
    states() {
      return State.getStatesOfCountry('US')
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    cities() {
      const selectedState = this.states.find(
        state => state.name === this.form.state
      )

      if (!selectedState) {
        return []
      }

      const allCities = City.getCitiesOfState(
        'US',
        selectedState.isoCode
      )

      // Remove duplicate city names and sort alphabetically.
      const uniqueNames = [
        ...new Set(allCities.map(city => city.name))
      ]

      return uniqueNames
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({ name }))
    },
  },

  async mounted() {
    await Promise.all([
      this.loadRestaurants(),
      this.loadCategories(),
    ])
  },

  methods: {
    async loadRestaurants() {
      this.loading = true

      try {
        const response = await APIService.getRestaurants()
        const data = response.data

        this.restaurants = Array.isArray(data)
          ? data
          : (data.results || [])
      } catch (error) {
        this.error = 'Unable to load restaurants.'
      } finally {
        this.loading = false
      }
    },

    async loadCategories() {
      try {
        const response = await APIService.getCategories()
        const data = response.data

        this.categories = Array.isArray(data)
          ? data
          : (data.results || [])
      } catch (error) {
        this.error = 'Unable to load categories.'
      }
    },

    categoryName(value) {
      if (value && typeof value === 'object') {
        return value.name
      }

      const category = this.categories.find(
        c => String(c.id) === String(value)
      )

      return category ? category.name : (value || 'N/A')
    },

    openAddForm() {
      this.editingId = null
      this.form = emptyForm()
      this.error = ''
      this.success = ''
      this.showForm = true
    },

    editRestaurant(restaurant) {
      this.editingId = restaurant.id

      // Support existing state names and state abbreviations.
      const existingState = this.states.find(
        state =>
          state.name.toLowerCase() ===
            String(restaurant.state || '').toLowerCase() ||
          state.isoCode.toLowerCase() ===
            String(restaurant.state || '').toLowerCase()
      )

      this.form = {
        name: restaurant.name || '',
        category: typeof restaurant.category === 'object'
          ? restaurant.category?.id
          : restaurant.category ?? '',
        phone_number: restaurant.phone_number || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        state: existingState
          ? existingState.name
          : restaurant.state || '',
        zip_code: restaurant.zip_code || '',
        description: restaurant.description || '',
      }

      this.error = ''
      this.success = ''
      this.showForm = true
    },

    closeForm() {
      this.showForm = false
      this.editingId = null
      this.form = emptyForm()
    },

    async saveRestaurant() {
      this.saving = true
      this.error = ''
      this.success = ''

      try {
        const payload = {
          ...this.form,
          category: Number(this.form.category),
        }

        if (this.editingId !== null) {
          await APIService.updateRestaurant(
            this.editingId,
            payload
          )
          this.success = 'Restaurant updated successfully.'
        } else {
          await APIService.addRestaurant(payload)
          this.success = 'Restaurant added successfully.'
        }

        this.closeForm()
        await this.loadRestaurants()
      } catch (error) {
        this.error = error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to save restaurant.'
      } finally {
        this.saving = false
      }
    },

    async removeRestaurant(restaurant) {
      if (!window.confirm(`Delete ${restaurant.name}?`)) {
        return
      }

      this.error = ''
      this.success = ''

      try {
        await APIService.deleteRestaurant(restaurant.id)
        this.success = 'Restaurant deleted successfully.'
        await this.loadRestaurants()
      } catch (error) {
        this.error = 'Unable to delete restaurant.'
      }
    },
  },
}
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

.actions {
  margin-bottom: 25px;
}

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

/* Add / Edit Form */
.restaurant-form {
  background: white;
  padding: 30px;
  border-radius: 14px;
  margin-bottom: 30px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.restaurant-form h3 {
  color: #71372e;
  font-size: 24px;
  margin-bottom: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-group label {
  font-size: 14px;
  font-weight: bold;
  color: #71372e;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  display: block;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 14px;
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 15px;
  color: #333;
  background: white;
  border: 1px solid #d8c9c3;
  border-radius: 8px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #71372e;
}

.form-group select:disabled {
  background: #f3f3f3;
  color: #999;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.form-actions button {
  padding: 12px 20px;
  font-weight: bold;
}

.cancel-btn {
  background: #777;
}

/* Restaurant Table */
.restaurant-section {
  background: white;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.restaurant-section h2 {
  color: #71372e;
  margin-bottom: 20px;
  font-size: 22px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

th {
  background: #f0e1dc;
  color: #71372e;
}

td {
  color: #71372e;
}

.row-actions {
  display: flex;
  gap: 10px;
}

.edit-btn {
  background: #44515e;
}

.delete-btn {
  background: #dc3545;
}

.empty-message {
  text-align: center;
  color: #777;
}

.error {
  color: #b42318;
  background: #fff0ee;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success {
  color: #198754;
  background: #e8f6ee;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* Mobile */
@media (max-width: 700px) {
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
    flex-wrap: wrap;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .restaurant-form,
  .restaurant-section {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .full-width {
    grid-column: auto;
  }

  .form-actions {
    flex-wrap: wrap;
  }
}
</style>
