
<template>
  <div class="admin-layout">
    <!-- Admin Sidebar -->
    <aside class="sidebar">
      <h2>Rate My Restaurant</h2>
      <p class="sidebar-label">ADMIN PANEL</p>

      <nav>
        <router-link to="/admin/dashboard">Dashboard</router-link>
        <router-link to="/admin/restaurants">Restaurants</router-link>
        <span class="sidebar-placeholder">Categories</span>
        <router-link to="/admin/reviews">Reviews</router-link>
        <span class="sidebar-placeholder">Users</span>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <header class="page-header">
        <div>
          <h1>Manage Reviews</h1>
          <p>View and manage customer reviews</p>
        </div>

        <span class="admin-badge">Administrator</span>
      </header>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <section class="review-section">
        <h2>All Reviews</h2>

        <p v-if="loading">Loading reviews...</p>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Restaurant</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="review in reviews" :key="review.id">
                <td>{{ review.username || 'Unknown' }}</td>

                <td>{{ restaurantName(review.restaurant, review) }}</td>

                <td class="rating">
                  {{ review.rating }} / 5
                </td>

                <td class="comment">
                  {{ review.comment || 'No comment' }}
                </td>

                <td>{{ formatDate(review.created_at) }}</td>

                <td>
                  <button
                    type="button"
                    class="delete-btn"
                    :disabled="deletingId === review.id"
                    @click="removeReview(review)"
                  >
                    {{ deletingId === review.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </td>
              </tr>

              <tr v-if="reviews.length === 0">
                <td colspan="6" class="empty-message">
                  No reviews found.
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
  name: 'AdminReviews',

  data() {
    return {
      reviews: [],
      loading: false,
      deletingId: null,
      error: '',
      success: '',
    }
  },

  async mounted() {
    await this.loadReviews()
  },

  methods: {
    async loadReviews() {
      this.loading = true
      this.error = ''

      try {
        const response = await APIService.getAdminReviews()
        const data = response.data

        const allReviews = Array.isArray(data)
          ? data
          : (data.results || [])

        this.reviews = allReviews.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      } catch (error) {
        this.error = 'Unable to load reviews.'
      } finally {
        this.loading = false
      }
    },

    restaurantName(restaurant, review) {
      return review?.restaurant_name || (
        restaurant && typeof restaurant === 'object'
          ? restaurant.name || 'Unknown restaurant'
          : restaurant || 'Unknown restaurant'
      )
    },

    formatDate(date) {
      if (!date) return 'N/A'

      return new Date(date).toLocaleDateString()
    },

    async removeReview(review) {
      const confirmed = window.confirm(
        `Are you sure you want to delete this review by ${review.username || 'this user'}?`
      )

      if (!confirmed) return

      this.deletingId = review.id
      this.error = ''
      this.success = ''

      try {
        await APIService.deleteAdminReview(review.id)

        this.reviews = this.reviews.filter(
          item => item.id !== review.id
        )

        this.success = 'Review deleted successfully.'
      } catch (error) {
        console.error('Delete review error:', error.response || error)
        this.error =
          error.response?.data?.detail ||
          error.message ||
          'Unable to delete review.'
      } finally {
        this.deletingId = null
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

/* Reviews Table */
.review-section {
  background: white;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.review-section h2 {
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

.rating {
  white-space: nowrap;
  font-weight: bold;
}

.comment {
  min-width: 180px;
  max-width: 300px;
  overflow-wrap: anywhere;
}

.delete-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.delete-btn:hover {
  opacity: 0.85;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  .review-section {
    padding: 20px;
  }
}
</style>