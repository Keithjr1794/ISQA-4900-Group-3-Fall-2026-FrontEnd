<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import APIService from '../api/APIService.js'
import { useAuthStore } from '../store/AuthStore.js'

const authStore = useAuthStore()

const restaurants = ref([])
const categories = ref([])
const selectedCategory = ref('')
const search = ref('')

const loading = ref(false)
const error = ref('')
const categoryError = ref('')

const selectedRestaurant = ref(null)
const reviews = ref([])
const reviewsLoading = ref(false)
const reviewsError = ref('')

const showReviewForm = ref(false)
const reviewRating = ref(5)
const reviewComment = ref('')
const reviewSubmitting = ref(false)
const reviewFormError = ref('')
const reviewSuccess = ref('')

const savingPlace = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

let restaurantRequest = 0
let reviewRequest = 0

const averageRating = computed(() => {
  if (!reviews.value.length) return null

  const total = reviews.value.reduce(
    (sum, review) => sum + Number(review.rating),
    0
  )

  return (total / reviews.value.length).toFixed(1)
})

const alreadyReviewed = computed(() =>
  reviews.value.some(
    (review) => review.user === authStore.user?.id
  )
)

// Collect results if the backend uses pagination.
async function collectResults(response) {
  if (Array.isArray(response.data)) {
    return response.data
  }

  const results = [...(response.data.results ?? [])]
  let next = response.data.next

  while (next) {
    const page = await axios.get(next, {
      headers: APIService.getAuthHeaders(),
    })

    results.push(...(page.data.results ?? []))
    next = page.data.next
  }

  return results
}

function getErrorMessage(err, fallback) {
  if (err.response?.status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  const data = err.response?.data

  if (data && typeof data === 'object') {
    return Object.values(data)
      .flat()
      .map(String)
      .join(' ')
  }

  return fallback
}

async function loadRestaurants() {
  const requestId = ++restaurantRequest

  loading.value = true
  error.value = ''

  const params = {}

  if (selectedCategory.value) {
    params.category = selectedCategory.value
  }

  if (search.value.trim()) {
    params.search = search.value.trim()
  }

  try {
    const response = await APIService.getRestaurants(params)
    const results = await collectResults(response)

    if (requestId === restaurantRequest) {
      restaurants.value = results
    }
  } catch (err) {
    if (requestId === restaurantRequest) {
      error.value = getErrorMessage(
        err,
        'Unable to load restaurants.'
      )
    }
  } finally {
    if (requestId === restaurantRequest) {
      loading.value = false
    }
  }
}

async function loadCategories() {
  try {
    const response = await APIService.getCategories()
    categories.value = await collectResults(response)
  } catch {
    categoryError.value = 'Unable to load categories.'
  }
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
  loadRestaurants()
}

function clearFilters() {
  search.value = ''
  selectedCategory.value = ''
  loadRestaurants()
}

function resetActions() {
  showReviewForm.value = false
  reviewRating.value = 5
  reviewComment.value = ''
  reviewFormError.value = ''
  reviewSuccess.value = ''
  saveError.value = ''
  saveSuccess.value = ''
}

function openRestaurant(restaurant) {
  resetActions()
  selectedRestaurant.value = restaurant
  loadReviews(restaurant.id)
}

async function loadReviews(restaurantId) {
  const requestId = ++reviewRequest

  reviews.value = []
  reviewsLoading.value = true
  reviewsError.value = ''

  try {
    const response = await APIService.getReviews(restaurantId)
    const results = await collectResults(response)

    if (requestId === reviewRequest) {
      reviews.value = results.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    }
  } catch (err) {
    if (requestId === reviewRequest) {
      reviewsError.value = getErrorMessage(
        err,
        'Unable to load reviews.'
      )
    }
  } finally {
    if (requestId === reviewRequest) {
      reviewsLoading.value = false
    }
  }
}

function backToList() {
  reviewRequest++
  selectedRestaurant.value = null
  reviews.value = []
  reviewsError.value = ''
  reviewsLoading.value = false
  resetActions()
}

function formatDate(value) {
  return new Date(value).toLocaleDateString()
}

async function submitReview() {
  if (reviewSubmitting.value) return

  const restaurantId = selectedRestaurant.value.id
  const comment = reviewComment.value.trim()

  reviewFormError.value = ''
  reviewSuccess.value = ''

  if (!comment) {
    reviewFormError.value = 'Please enter your review.'
    return
  }

  reviewSubmitting.value = true

  try {
    await APIService.addReview({
      restaurant: restaurantId,
      rating: Number(reviewRating.value),
      comment,
    })

    if (selectedRestaurant.value?.id === restaurantId) {
      showReviewForm.value = false
      reviewComment.value = ''
      reviewSuccess.value = 'Your review was posted.'
      await loadReviews(restaurantId)
    }
  } catch (err) {
    if (selectedRestaurant.value?.id === restaurantId) {
      reviewFormError.value = getErrorMessage(
        err,
        'Unable to post your review.'
      )
    }
  } finally {
    reviewSubmitting.value = false
  }
}

async function saveToPlaces() {
  if (savingPlace.value) return

  const restaurantId = selectedRestaurant.value.id

  savingPlace.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    await APIService.saveRestaurant(
      restaurantId,
      'want_to_visit'
    )

    if (selectedRestaurant.value?.id === restaurantId) {
      saveSuccess.value = 'Saved to My Places as Want to Visit.'
    }
  } catch (err) {
    if (selectedRestaurant.value?.id === restaurantId) {
      saveError.value = getErrorMessage(
        err,
        'Unable to save this restaurant.'
      )
    }
  } finally {
    savingPlace.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadRestaurants()
})
</script>

<template>
  <section class="restaurant-page">
    <!-- Restaurant list -->
    <template v-if="!selectedRestaurant">
      <h1>Restaurants</h1>
      <p class="intro">Discover a new place to eat.</p>

      <form class="search-bar" @submit.prevent="loadRestaurants">
        <label class="search-field">
          <span>Search restaurants</span>

          <input
            v-model="search"
            type="search"
            placeholder="Search by name, city, or description"
          />
        </label>

        <button type="submit">Search</button>

        <button
          type="button"
          class="secondary-button"
          @click="clearFilters"
        >
          Clear
        </button>
      </form>

      <div class="category-filters" aria-label="Filter by category">
        <button
          type="button"
          class="category-button"
          :class="{ active: selectedCategory === '' }"
          :aria-pressed="selectedCategory === ''"
          @click="selectCategory('')"
        >
          All
        </button>

        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="category-button"
          :class="{ active: selectedCategory === category.id }"
          :aria-pressed="selectedCategory === category.id"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <p v-if="categoryError" role="alert">
        {{ categoryError }}
      </p>

      <p v-if="loading" role="status">
        Loading restaurants...
      </p>

      <div v-else-if="error" role="alert">
        <p>{{ error }}</p>
        <button @click="loadRestaurants">Try Again</button>
      </div>

      <template v-else>
        <p class="result-count">
          {{ restaurants.length }}
          {{ restaurants.length === 1 ? 'restaurant' : 'restaurants' }}
          found
        </p>

        <p v-if="restaurants.length === 0">
          No restaurants match your search.
        </p>

        <div v-else class="restaurant-list">
          <button
            v-for="restaurant in restaurants"
            :key="restaurant.id"
            type="button"
            class="restaurant-card"
            @click="openRestaurant(restaurant)"
          >
            <span class="card-heading">
              <span class="restaurant-name">
                {{ restaurant.name }}
              </span>

              <span class="details-link">
                View Details →
              </span>
            </span>

            <span class="restaurant-meta">
              {{ restaurant.category_name }}
              · {{ restaurant.city }}, {{ restaurant.state }}
            </span>

            <span
              v-if="restaurant.description"
              class="card-description"
            >
              {{ restaurant.description }}
            </span>
          </button>
        </div>
      </template>
    </template>

    <!-- Restaurant details -->
    <template v-else>
      <button
        type="button"
        class="back-button"
        :disabled="reviewSubmitting || savingPlace"
        @click="backToList"
      >
        ← Back to Restaurants
      </button>

      <article class="details-card">
        <span class="category-label">
          {{ selectedRestaurant.category_name }}
        </span>

        <h1>{{ selectedRestaurant.name }}</h1>

        <p class="address">
          {{ selectedRestaurant.address }},
          {{ selectedRestaurant.city }},
          {{ selectedRestaurant.state }}
        </p>

        <p
          v-if="!reviewsLoading && !reviewsError"
          class="rating-summary"
        >
          <template v-if="averageRating">
            ★ {{ averageRating }} / 5
            <span>
              · {{ reviews.length }}
              {{ reviews.length === 1 ? 'review' : 'reviews' }}
            </span>
          </template>

          <template v-else>
            No ratings yet
          </template>
        </p>

        <p class="description">
          {{ selectedRestaurant.description || 'No description available.' }}
        </p>

        <div class="detail-actions">
          <button
            v-if="!alreadyReviewed"
            type="button"
            :disabled="reviewSubmitting || reviewsLoading"
            @click="showReviewForm = !showReviewForm"
          >
            {{ showReviewForm ? 'Cancel Review' : 'Write a Review' }}
          </button>

          <button
            type="button"
            class="secondary-button"
            :disabled="savingPlace || Boolean(saveSuccess)"
            @click="saveToPlaces"
          >
            {{
              savingPlace
                ? 'Saving...'
                : saveSuccess
                  ? 'Saved ✓'
                  : 'Save to My Places'
            }}
          </button>
        </div>

        <p v-if="alreadyReviewed && !reviewSuccess" class="muted">
          You have already reviewed this restaurant.
        </p>

        <p
          v-if="saveSuccess"
          class="success-message"
          role="status"
        >
          {{ saveSuccess }}
          <router-link to="/my-places">
            View My Places
          </router-link>
        </p>

        <p v-if="saveError" role="alert">
          {{ saveError }}
        </p>

        <p
          v-if="reviewSuccess"
          class="success-message"
          role="status"
        >
          {{ reviewSuccess }}
        </p>

        <!-- Write a review -->
        <form
          v-if="showReviewForm && !alreadyReviewed"
          class="review-form"
          @submit.prevent="submitReview"
        >
          <h2>Write a Review</h2>

          <p>
            Posting as {{ authStore.user?.username }}
          </p>

          <label for="review-rating">Rating</label>
          <select
            id="review-rating"
            v-model="reviewRating"
            :disabled="reviewSubmitting"
            required
          >
            <option :value="5">5 — Excellent</option>
            <option :value="4">4 — Good</option>
            <option :value="3">3 — Average</option>
            <option :value="2">2 — Poor</option>
            <option :value="1">1 — Very Poor</option>
          </select>

          <label for="review-comment">Your Review</label>
          <textarea
            id="review-comment"
            v-model="reviewComment"
            rows="4"
            placeholder="Tell us about your experience."
            :disabled="reviewSubmitting"
            required
          ></textarea>

          <p v-if="reviewFormError" role="alert">
            {{ reviewFormError }}
          </p>

          <button type="submit" :disabled="reviewSubmitting">
            {{ reviewSubmitting ? 'Posting...' : 'Submit Review' }}
          </button>
        </form>
      </article>

      <!-- Existing reviews -->
      <section class="reviews-section">
        <h2>Reviews</h2>

        <p v-if="reviewsLoading" role="status">
          Loading reviews...
        </p>

        <div v-else-if="reviewsError" role="alert">
          <p>{{ reviewsError }}</p>

          <button @click="loadReviews(selectedRestaurant.id)">
            Try Again
          </button>
        </div>

        <p v-else-if="reviews.length === 0">
          This restaurant has no reviews yet.
        </p>

        <div v-else class="reviews-list">
          <article
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-heading">
              <strong>{{ review.username || 'User' }}</strong>

              <time :datetime="review.created_at">
                {{ formatDate(review.created_at) }}
              </time>
            </div>

            <p class="review-rating">
              {{ review.rating }} / 5 ★
            </p>

            <p class="review-comment">
              {{ review.comment }}
            </p>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.restaurant-page {
  width: 100%;
  max-width: 1050px;
  margin: auto;
  padding: 40px 24px 60px;
}

h1,
h2 {
  color: #71372e;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 38px);
}

.intro,
.address,
.restaurant-meta,
.muted {
  color: #735c50;
}

p {
  line-height: 1.7;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  padding: 12px 18px;
  background: #71372e;
  color: #f7eee3;
  border: 1px solid #71372e;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: default;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #71372e;
  outline-offset: 4px;
}

.search-bar {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 20px;
}

.search-field {
  display: grid;
  flex: 1;
  gap: 8px;
  min-width: 220px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px;
  background: white;
  color: #512b25;
  border: 1px solid #bda99b;
  border-radius: 6px;
}

textarea {
  resize: vertical;
}

.secondary-button {
  background: transparent;
  color: #71372e;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.category-button {
  padding: 7px 16px;
  background: white;
  color: #71372e;
  border: 1px solid #d9c3b2;
  border-radius: 24px;
}

.category-button:hover {
  background: #eee1d4;
}

.category-button.active {
  background: #71372e;
  color: white;
  border-color: #71372e;
}

.result-count {
  color: #735c50;
  font-size: 14px;
}

.restaurant-list,
.reviews-list {
  display: grid;
  gap: 16px;
}

.restaurant-card {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 24px;
  background: white;
  color: #512b25;
  border: 1px solid #d9c3b2;
  border-radius: 8px;
  text-align: left;
}

.restaurant-card:hover {
  background: #fffaf6;
  border-color: #71372e;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.restaurant-name {
  color: #71372e;
  font-size: 22px;
  font-weight: bold;
}

.details-link {
  color: #71372e;
  font-size: 14px;
}

.restaurant-meta {
  font-size: 14px;
}

.card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.6;
}

.back-button {
  margin-bottom: 24px;
  padding: 8px 0;
  background: transparent;
  color: #71372e;
  border: none;
}

.details-card {
  padding: 30px;
  background: white;
  border: 1px solid #d9c3b2;
  border-radius: 8px;
}

.category-label {
  display: inline-block;
  margin-bottom: 16px;
  padding: 6px 14px;
  background: #eee1d4;
  color: #633d32;
  border-radius: 20px;
  font-size: 14px;
}

.rating-summary {
  color: #71372e;
  font-weight: bold;
}

.rating-summary span {
  color: #735c50;
  font-weight: normal;
}

.description,
.review-comment {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.description {
  margin-bottom: 0;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.review-form {
  display: grid;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #d9c3b2;
}

.review-form h2,
.review-form p {
  margin: 0;
}

.review-form label {
  font-weight: bold;
}

.success-message {
  color: #28572b;
}

.success-message a {
  color: #71372e;
  font-weight: bold;
}

.reviews-section {
  margin-top: 32px;
}

.review-card {
  padding: 24px;
  background: white;
  border: 1px solid #d9c3b2;
  border-radius: 8px;
}

.review-heading {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.review-heading time {
  color: #735c50;
  font-size: 14px;
}

.review-rating {
  margin: 12px 0;
  color: #71372e;
  font-weight: bold;
}

.review-comment {
  margin-bottom: 0;
}

[role="alert"] {
  color: #8c2222;
}

@media (max-width: 600px) {
  .restaurant-page {
    padding: 28px 16px;
  }

  .restaurant-card,
  .details-card,
  .review-card {
    padding: 20px;
  }
}
</style>