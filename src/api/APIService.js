import axios from 'axios'

export const API_URL = 'http://127.0.0.1:8000'

export class APIService {
  getAuthHeaders() {
    const access = localStorage.getItem('access')

    return access
      ? { Authorization: `Bearer ${access}` }
      : {}
  }

  // Restaurants
  getRestaurants(params = {}) {
    return axios.get(`${API_URL}/api/restaurants/`, {
      params,
      headers: this.getAuthHeaders(),
    })
  }

  getRestaurant(id) {
    return axios.get(`${API_URL}/api/restaurants/${id}/`, {
      headers: this.getAuthHeaders(),
    })
  }

  addRestaurant(restaurant) {
    return axios.post(
      `${API_URL}/api/restaurants/`,
      restaurant,
      { headers: this.getAuthHeaders() }
    )
  }

  updateRestaurant(id, restaurant) {
    return axios.patch(
      `${API_URL}/api/restaurants/${id}/`,
      restaurant,
      { headers: this.getAuthHeaders() }
    )
  }

  deleteRestaurant(id) {
    return axios.delete(`${API_URL}/api/restaurants/${id}/`, {
      headers: this.getAuthHeaders(),
    })
  }

  // Categories
  getCategories() {
    return axios.get(`${API_URL}/api/categories/`, {
      headers: this.getAuthHeaders(),
    })
  }

  // Reviews
  getReviews(restaurantId) {
    return axios.get(`${API_URL}/api/reviews/`, {
      params: restaurantId ? { restaurant: restaurantId } : {},
      headers: this.getAuthHeaders(),
    })
  }

  addReview(review) {
    return axios.post(`${API_URL}/api/reviews/`, review, {
      headers: this.getAuthHeaders(),
    })
  }

  updateReview(id, review) {
    return axios.patch(`${API_URL}/api/reviews/${id}/`, review, {
      headers: this.getAuthHeaders(),
    })
  }

  deleteReview(id) {
    return axios.delete(`${API_URL}/api/reviews/${id}/`, {
      headers: this.getAuthHeaders(),
    })
  }

  // My Places
  getSavedRestaurants() {
    return axios.get(`${API_URL}/api/saved-restaurants/`, {
      headers: this.getAuthHeaders(),
    })
  }

  saveRestaurant(restaurantId, status = 'want_to_visit') {
    return axios.post(
      `${API_URL}/api/saved-restaurants/`,
      {
        restaurant: restaurantId,
        status,
      },
      { headers: this.getAuthHeaders() }
    )
  }

  updateSavedRestaurant(id, status) {
    return axios.patch(
      `${API_URL}/api/saved-restaurants/${id}/`,
      { status },
      { headers: this.getAuthHeaders() }
    )
  }

  deleteSavedRestaurant(id) {
    return axios.delete(`${API_URL}/api/saved-restaurants/${id}/`, {
      headers: this.getAuthHeaders(),
    })
  }

  // Authentication
  authenticateLogin(credentials) {
    return axios.post(`${API_URL}/api/token/`, credentials)
  }

  registerUser(credentials) {
    return axios.post(`${API_URL}/api/register/`, credentials)
  }

  refreshToken(refresh) {
    return axios.post(`${API_URL}/api/token/refresh/`, {
      refresh,
    })
  }

  getCurrentUser() {
    return axios.get(`${API_URL}/api/me/`, {
      headers: this.getAuthHeaders(),
    })
  }
}

export default new APIService()