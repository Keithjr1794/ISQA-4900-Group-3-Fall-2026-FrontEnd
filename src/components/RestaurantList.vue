
<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import APIService from '../api/APIService.js'
import { useAuthStore } from '../store/AuthStore.js'

const authStore = useAuthStore()
const route = useRoute()
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
const hoveredRating = ref(0)
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
    (sum, review) => sum + Number(review.rating), 0
  )
  return (total / reviews.value.length).toFixed(1)
})

const alreadyReviewed = computed(() =>
  reviews.value.some(
    review => review.user === authStore.user?.id
  )
)

async function collectResults(response) {
  if (Array.isArray(response.data)) return response.data

  const results = [...(response.data.results ?? [])]
  let next = response.data.next

  while (next) {
    const page = await axios.get(next, {
      headers: APIService.getAuthHeaders()
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
    return Object.values(data).flat().map(String).join(' ')
  }
  return fallback
}

async function loadRestaurants() {
  const id = ++restaurantRequest
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
    if (id === restaurantRequest) restaurants.value = results
  } catch (err) {
    if (id === restaurantRequest) {
      error.value = getErrorMessage(
        err, 'Unable to load restaurants.'
      )
    }
  } finally {
    if (id === restaurantRequest) loading.value = false
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

function selectCategory(id) {
  selectedCategory.value = id
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
  hoveredRating.value = 0
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
  const id = ++reviewRequest
  reviews.value = []
  reviewsLoading.value = true
  reviewsError.value = ''

  try {
    const response = await APIService.getReviews(restaurantId)
    const results = await collectResults(response)
    if (id === reviewRequest) {
      reviews.value = results.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    }
  } catch (err) {
    if (id === reviewRequest) {
      reviewsError.value = getErrorMessage(
        err, 'Unable to load reviews.'
      )
    }
  } finally {
    if (id === reviewRequest) reviewsLoading.value = false
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
  if (reviewSubmitting.value || !selectedRestaurant.value) return

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
      comment
    })

    if (selectedRestaurant.value?.id === restaurantId) {
      showReviewForm.value = false
      reviewComment.value = ''
      reviewSuccess.value = 'Your review was posted!'
      await loadReviews(restaurantId)
    }
  } catch (err) {
    reviewFormError.value = getErrorMessage(
      err, 'Unable to post your review.'
    )
  } finally {
    reviewSubmitting.value = false
  }
}

async function saveToPlaces() {
  if (savingPlace.value || !selectedRestaurant.value) return

  const restaurantId = selectedRestaurant.value.id
  savingPlace.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    await APIService.saveRestaurant(
      restaurantId, 'want_to_visit'
    )
    if (selectedRestaurant.value?.id === restaurantId) {
      saveSuccess.value = 'Saved to My Places!'
    }
  } catch (err) {
    saveError.value = getErrorMessage(
      err, 'Unable to save this restaurant.'
    )
  } finally {
    savingPlace.value = false
  }
}

onMounted(async () => {
  loadCategories()
  await loadRestaurants()

  if (route.params.id) {
    try {
      const response = await APIService.getRestaurant(route.params.id)
      openRestaurant(response.data)
    } catch (err) {
      console.error('Unable to open restaurant:', err)
      error.value = 'Unable to load restaurant details.'
    }
  }
})
</script>

<template>
  <section class="restaurant-page">

    <!-- HERO SECTION -->
    <template v-if="!selectedRestaurant">
      <div class="hero">
        <div class="hero-content">
          <span class="eyebrow">✦ RATE MY RESTAURANT</span>
          <h1>
            Discover your next
            <em>favorite</em> restaurant.
          </h1>
          <p>
            Explore local favorites, share honest reviews,
            and save the places you can't wait to try.
          </p>
          <div class="hero-tags">
            <span>✦ Explore</span>
            <span>★ Review</span>
            <span>♡ Save Favorites</span>
          </div>
        </div>
        <div class="hero-decoration" aria-hidden="true">
          <div class="plate">🍽️</div>
          <p>Good food. Great memories.</p>
        </div>
      </div>

      <!-- SEARCH SECTION -->
      <div class="section-heading">
        <span class="eyebrow">EXPLORE & DISCOVER</span>
        <h2>Find your perfect spot</h2>
        <p>Great restaurants are waiting to be discovered.</p>
      </div>

      <form class="search-bar" @submit.prevent="loadRestaurants">
        <label class="search-field">
          <span>Search Restaurants</span>
          <input
            v-model="search"
            type="search"
            placeholder="Search by name, city, or description..."
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

      <!-- CATEGORY FILTERS -->
      <div class="category-filters">
        <button
          type="button"
          class="category-button"
          :class="{ active: selectedCategory === '' }"
          @click="selectCategory('')"
        >
          All Restaurants
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="category-button"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <p v-if="categoryError" role="alert">
        {{ categoryError }}
      </p>

      <!-- LOADING -->
      <div v-if="loading" class="empty-state" role="status">
        <div class="empty-icon">🍽️</div>
        <h3>Finding delicious places...</h3>
        <p>Loading restaurants, please wait.</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="empty-state" role="alert">
        <h3>Something went wrong</h3>
        <p>{{ error }}</p>
        <button @click="loadRestaurants">Try Again</button>
      </div>

      <template v-else>
        <p class="result-count">
          {{ restaurants.length }}
          {{ restaurants.length === 1 ? 'restaurant' : 'restaurants' }}
          found
        </p>

        <!-- EMPTY STATE -->
        <div v-if="restaurants.length === 0" class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>No restaurants found yet</h3>
          <p>
            Try a different search or clear your filters.
            Restaurants may also need to be added in the backend.
          </p>
          <button @click="clearFilters">
            Show All Restaurants
          </button>
        </div>

        <!-- RESTAURANT CARDS -->
        <div v-else class="restaurant-list">
          <button
            v-for="restaurant in restaurants"
            :key="restaurant.id"
            type="button"
            class="restaurant-card"
            @click="openRestaurant(restaurant)"
          >
            <span class="card-top">
              <span class="restaurant-icon">✦</span>
              <span class="details-link">Explore →</span>
            </span>

            <span class="restaurant-name">
              {{ restaurant.name }}
            </span>

            <span class="restaurant-meta">
              📍 {{ restaurant.city }}, {{ restaurant.state }}
            </span>

            <span class="category-label">
              {{ restaurant.category_name || 'Restaurant' }}
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

    <!-- RESTAURANT DETAILS -->
    <template v-else>
      <button class="back-button" @click="backToList">
        ← Back to Restaurants
      </button>

      <article class="details-card">
        <span class="category-label">
          {{ selectedRestaurant.category_name }}
        </span>

        <h1>{{ selectedRestaurant.name }}</h1>

        <p class="address">
          📍 {{ selectedRestaurant.address }},
          {{ selectedRestaurant.city }},
          {{ selectedRestaurant.state }}
        </p>

        <p
          v-if="!reviewsLoading && !reviewsError"
          class="rating-summary"
        >
          <template v-if="averageRating">
            ★ {{ averageRating }} / 5
            · {{ reviews.length }}
            {{ reviews.length === 1 ? 'review' : 'reviews' }}
          </template>
          <template v-else>
            No ratings yet
          </template>
        </p>

        <p class="description">
          {{
            selectedRestaurant.description ||
            'No description available.'
          }}
        </p>

        <div class="detail-actions">
          <button
            v-if="!alreadyReviewed"
            :disabled="reviewSubmitting || reviewsLoading"
            @click="showReviewForm = !showReviewForm"
          >
            {{ showReviewForm ? 'Cancel Review' : '★ Write a Review' }}
          </button>

          <button
            class="secondary-button"
            :disabled="savingPlace || Boolean(saveSuccess)"
            @click="saveToPlaces"
          >
            {{
              savingPlace ? 'Saving...' :
              saveSuccess ? 'Saved ✓' : '♡ Save to My Places'
            }}
          </button>
        </div>

        <p v-if="alreadyReviewed" class="muted">
          You have already reviewed this restaurant.
        </p>

        <p v-if="saveSuccess" class="success-message" role="status">
          {{ saveSuccess }}
          <router-link to="/my-places">
            View My Places
          </router-link>
        </p>

        <p v-if="saveError" role="alert">{{ saveError }}</p>
        <p v-if="reviewSuccess" class="success-message" role="status">
          {{ reviewSuccess }}
        </p>

        <!-- REVIEW FORM -->
        <form
          v-if="showReviewForm && !alreadyReviewed"
          class="review-form"
          @submit.prevent="submitReview"
        >
          <h2>Share Your Experience</h2>
          <p>Posting as {{ authStore.user?.username }}</p>

          <label>How would you rate this restaurant?</label>
          <div class="star-picker" role="group" aria-label="Rating">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-button"
              :class="{
                lit: star <= (hoveredRating || reviewRating)
              }"
              :aria-label="`${star} stars`"
              :aria-pressed="reviewRating === star"
              :disabled="reviewSubmitting"
              @mouseenter="hoveredRating = star"
              @mouseleave="hoveredRating = 0"
              @focus="hoveredRating = star"
              @blur="hoveredRating = 0"
              @click="reviewRating = star"
            >
              ★
            </button>
            <span class="rating-label">{{ reviewRating }} / 5</span>
          </div>

          <label for="review-comment">Your Review</label>
          <textarea
            id="review-comment"
            v-model="reviewComment"
            rows="4"
            placeholder="Tell us about your experience..."
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

      <!-- EXISTING REVIEWS -->
      <section class="reviews-section">
        <h2>Community Reviews</h2>

        <p v-if="reviewsLoading" role="status">
          Loading reviews...
        </p>

        <div v-else-if="reviewsError" role="alert">
          <p>{{ reviewsError }}</p>
          <button @click="loadReviews(selectedRestaurant.id)">
            Try Again
          </button>
        </div>

        <p v-else-if="reviews.length === 0" class="muted">
          No reviews yet. Be the first to share your experience!
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
              ★ {{ review.rating }} / 5
            </p>
            <p class="review-comment">{{ review.comment }}</p>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.restaurant-page {
  max-width: 1180px;
  margin: auto;
  padding: 28px 24px 70px;
  color: #392723;
}

h1, h2, h3 {
  color: #71372e;
}

p {
  line-height: 1.7;
}

button, input, textarea {
  font: inherit;
}

button {
  padding: 12px 20px;
  background: #71372e;
  color: #fff7ef;
  border: 1px solid #71372e;
  border-radius: 9px;
  cursor: pointer;
  transition: 0.2s ease;
}

button:hover:not(:disabled) {
  background: #8d4a4c;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 3px solid #d59a37;
  outline-offset: 3px;
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  background: linear-gradient(120deg, #52242e, #914d59);
  color: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 40px #52242e25;
}

.hero-content {
  padding: clamp(30px, 5vw, 65px);
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 800;
  color: #d5a76e;
}

.hero .eyebrow {
  color: #f2d4a4;
}

.hero h1 {
  color: white;
  font-size: clamp(34px, 4.5vw, 55px);
  line-height: 1.15;
  margin: 20px 0;
}

.hero h1 em {
  color: #f5d5aa;
  font-family: Georgia, serif;
}

.hero p {
  color: #f6e7df;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 25px;
}

.hero-tags span {
  padding: 8px 13px;
  border: 1px solid #ffffff55;
  border-radius: 30px;
  font-size: 12px;
}

.hero-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #dcae86, #85404e);
}

.plate {
  display: grid;
  place-items: center;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 8px solid #fff7ec;
  background: #f9e8d5;
  font-size: 70px;
  box-shadow: 0 12px 35px #32121c55;
}

.hero-decoration p {
  font-size: 13px;
  letter-spacing: 1px;
}

/* Search */
.section-heading {
  margin: 45px 0 22px;
}

.section-heading h2 {
  font-size: 30px;
  margin: 8px 0;
}

.section-heading p {
  color: #735c50;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
  padding: 22px;
  background: #fffaf6;
  border: 1px solid #eaded3;
  border-radius: 16px;
}

.search-field {
  display: grid;
  flex: 1;
  gap: 8px;
  min-width: 220px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 13px;
  background: white;
  color: #512b25;
  border: 1px solid #bda99b;
  border-radius: 8px;
}

.secondary-button {
  background: transparent;
  color: #71372e;
}

.secondary-button:hover:not(:disabled) {
  color: white;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 24px 0;
}

.category-button {
  background: white;
  color: #71372e;
  border: 1px solid #d9c3b2;
  border-radius: 30px;
  padding: 9px 18px;
}

.category-button.active {
  background: #71372e;
  color: white;
}

.result-count, .muted {
  color: #735c50;
}

/* Restaurant cards */
.restaurant-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.restaurant-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 13px;
  width: 100%;
  min-height: 190px;
  padding: 25px;
  background: white;
  color: #392723;
  border: 1px solid #e1cfc3;
  border-radius: 17px;
  text-align: left;
  box-shadow: 0 8px 22px #52242e0d;
}

.restaurant-card:hover {
  transform: translateY(-4px);
  background: #fffaf6;
  box-shadow: 0 18px 35px #52242e20;
}

.card-top {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.restaurant-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: #f4e5d9;
  color: #8c4c51;
  border-radius: 11px;
}

.details-link {
  color: #71372e;
  font-size: 13px;
  font-weight: bold;
}

.restaurant-name {
  font-size: 23px;
  font-weight: bold;
  color: #71372e;
}

.restaurant-meta {
  color: #735c50;
  font-size: 14px;
}

.category-label {
  display: inline-block;
  padding: 7px 14px;
  background: #eee1d4;
  color: #633d32;
  border-radius: 30px;
  font-size: 13px;
}

.card-description {
  color: #735c50;
  line-height: 1.6;
}

/* Empty state */
.empty-state {
  padding: 55px 24px;
  background: #fffaf6;
  border: 1px dashed #d9c3b2;
  border-radius: 18px;
  text-align: center;
}

.empty-icon {
  font-size: 52px;
}

.empty-state h3 {
  font-size: 24px;
}

.empty-state p {
  max-width: 480px;
  margin: 0 auto 22px;
  color: #735c50;
}

/* Details */
.back-button {
  margin-bottom: 24px;
  background: transparent;
  color: #71372e;
  border: none;
}

.back-button:hover {
  color: #71372e;
  background: #f4e5d9;
}

.details-card, .review-card {
  padding: 30px;
  background: white;
  border: 1px solid #e1cfc3;
  border-radius: 18px;
  box-shadow: 0 10px 25px #52242e0d;
}

.details-card h1 {
  margin: 18px 0;
  font-size: 38px;
}

.address, .description {
  color: #735c50;
}

.description, .review-comment {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.rating-summary, .review-rating {
  color: #b17b26;
  font-weight: bold;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 25px;
}

/* Star rating */
.review-form {
  display: grid;
  gap: 14px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e1cfc3;
}

.review-form label {
  font-weight: bold;
}

.star-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.star-button {
  padding: 3px 6px;
  background: transparent;
  color: #cbbeb4;
  border: none;
  font-size: 35px;
}

.star-button.lit {
  color: #d59a37;
}

.star-button:hover:not(:disabled) {
  background: transparent;
  color: #d59a37;
  transform: scale(1.12);
}

.rating-label {
  margin-left: 12px;
  color: #735c50;
  font-weight: bold;
}

textarea {
  resize: vertical;
}

.success-message {
  color: #28572b;
}

.success-message a {
  color: #71372e;
  font-weight: bold;
}

/* Reviews */
.reviews-section {
  margin-top: 35px;
}

.reviews-list {
  display: grid;
  gap: 16px;
}

.review-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.review-heading time {
  color: #735c50;
  font-size: 13px;
}

[role="alert"] {
  color: #8c2222;
}

/* Mobile */
@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-decoration {
    display: none;
  }

  .restaurant-list {
    grid-template-columns: 1fr;
  }

  .restaurant-page {
    padding: 20px 15px 50px;
  }

  .details-card, .review-card {
    padding: 20px;
  }

  .section-heading h2 {
    font-size: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
