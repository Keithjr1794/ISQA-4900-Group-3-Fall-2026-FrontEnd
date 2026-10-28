
<template>
  <section class="places-page">
    <div class="page-heading">
      <span class="eyebrow">♡ YOUR COLLECTION</span>
      <h1>My Places</h1>
      <p>Keep your favorite restaurants close and plan your next visit.</p>
    </div>

    <div v-if="loading" class="message">
      Loading your saved restaurants...
    </div>

    <div v-else-if="error" class="message">
      <h2>Something went wrong</h2>
      <p>{{ error }}</p>
      <button @click="loadPlaces">Try Again</button>
    </div>

    <div v-else-if="places.length === 0" class="empty-state">
      <div class="empty-icon">♡</div>
      <h2>No saved restaurants yet</h2>
      <p>Explore restaurants and save the ones you love!</p>

      <router-link to="/restaurants" class="primary-button">
        Explore Restaurants →
      </router-link>
    </div>

    <template v-else>
      <div class="collection-count">
        ♡ {{ places.length }}
        {{ places.length === 1 ? 'saved place' : 'saved places' }}
      </div>

      <div class="places-grid">
        <article
          v-for="place in places"
          :key="place.id"
          class="place-card"
        >
          <div class="card-top">
            <span class="category">
              {{ categoryName(place.restaurant) }}
            </span>
            <span class="heart">♥</span>
          </div>

          <h2>{{ restaurantName(place.restaurant) }}</h2>

          <p class="location">
            📍 {{ restaurantLocation(place.restaurant) }}
          </p>

          <p class="description">
            {{ restaurantDescription(place.restaurant) }}
          </p>

          <span class="saved-label">
            ✓ Saved to My Places
          </span>

          <div class="card-actions">
            <router-link
              v-if="restaurantId(place.restaurant)"
              :to="`/restaurants/${restaurantId(place.restaurant)}`"
              class="primary-button"
            >
              View Restaurant →
            </router-link>

            <button
              class="remove-button"
              :disabled="removingId === place.id"
              @click="removePlace(place)"
            >
              {{ removingId === place.id ? 'Removing...' : 'Remove ♡' }}
            </button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import APIService from '../api/APIService'

const places = ref([])
const loading = ref(true)
const error = ref('')
const removingId = ref(null)

// Get restaurant ID whether the API returns
// a number or a complete restaurant object.
function restaurantId(restaurant) {
  return typeof restaurant === 'object' && restaurant !== null
    ? restaurant.id
    : restaurant
}

// Display the real restaurant name.
function restaurantName(restaurant) {
  return typeof restaurant === 'object' && restaurant !== null
    ? restaurant.name || 'Restaurant'
    : 'Saved Restaurant'
}

// Display restaurant city and state.
function restaurantLocation(restaurant) {
  if (typeof restaurant !== 'object' || restaurant === null) {
    return 'Location unavailable'
  }

  return [restaurant.city, restaurant.state]
    .filter(Boolean)
    .join(', ') || restaurant.address || 'Location unavailable'
}

// Display the restaurant description.
function restaurantDescription(restaurant) {
  if (typeof restaurant !== 'object' || restaurant === null) {
    return 'One of your saved restaurants.'
  }

  return restaurant.description || 'A place worth visiting!'
}

// Display restaurant category.
function categoryName(restaurant) {
  if (typeof restaurant !== 'object' || restaurant === null) {
    return 'Restaurant'
  }

  const category = restaurant.category

  if (typeof category === 'object' && category !== null) {
    return category.name || 'Restaurant'
  }

  return restaurant.category_name || 'Restaurant'
}

// Load saved restaurants and retrieve full details
// when the saved-restaurants API returns only IDs.
async function loadPlaces() {
  loading.value = true
  error.value = ''

  try {
    const response = await APIService.getSavedRestaurants()
    const data = response.data

    const savedPlaces = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : []

    places.value = await Promise.all(
      savedPlaces.map(async (place) => {
        const id = restaurantId(place.restaurant)

        // Keep existing restaurant details if already provided.
        if (
          !id ||
          (
            typeof place.restaurant === 'object' &&
            place.restaurant !== null &&
            place.restaurant.name
          )
        ) {
          return place
        }

        try {
          const restaurantResponse = await APIService.getRestaurant(id)

          return {
            ...place,
            restaurant: restaurantResponse.data,
          }
        } catch (err) {
          console.error(
            `Unable to load restaurant ${id}:`,
            err
          )

          // Keep the saved entry even if details fail.
          return place
        }
      })
    )
  } catch (err) {
    console.error('Unable to load saved restaurants:', err)
    error.value = 'Could not load your saved restaurants.'
  } finally {
    loading.value = false
  }
}

// Remove a restaurant from My Places.
async function removePlace(place) {
  if (!window.confirm('Remove this restaurant from My Places?')) {
    return
  }

  removingId.value = place.id

  try {
    await APIService.deleteSavedRestaurant(place.id)

    places.value = places.value.filter(
      item => item.id !== place.id
    )
  } catch (err) {
    console.error('Unable to remove restaurant:', err)
    error.value = 'Could not remove the restaurant. Please try again.'
  } finally {
    removingId.value = null
  }
}

onMounted(loadPlaces)
</script>

<style scoped>
.places-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 24px 90px;
  color: #71372e;
}

.page-heading {
  margin-bottom: 34px;
}

.eyebrow {
  color: #bd855c;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 3px;
}

h1 {
  font-size: clamp(36px, 5vw, 52px);
  margin: 12px 0;
}

.page-heading p {
  color: #84675e;
  font-size: 17px;
}

.collection-count {
  margin-bottom: 22px;
  font-weight: 700;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.place-card {
  background: #fffaf6;
  border: 1px solid #ead9cf;
  border-radius: 22px;
  padding: 28px;
  box-shadow: 0 12px 30px rgba(80, 35, 35, 0.07);
  transition: transform 0.2s, box-shadow 0.2s;
}

.place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 35px rgba(80, 35, 35, 0.12);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category {
  background: #f2e7e5;
  color: #71372e;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
}

.heart {
  color: #9b4963;
  font-size: 25px;
}

.place-card h2 {
  margin: 24px 0 10px;
  font-size: 25px;
}

.location {
  color: #9b6470;
  font-size: 14px;
}

.description {
  color: #765e56;
  line-height: 1.7;
  min-height: 70px;
}

.saved-label {
  display: inline-block;
  color: #4e8062;
  font-size: 13px;
  font-weight: 700;
  margin: 12px 0 20px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.primary-button,
.remove-button,
.message button {
  display: inline-block;
  padding: 12px 17px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button,
.message button {
  background: #71372e;
  color: white;
  border: 1px solid #71372e;
}

.remove-button {
  background: transparent;
  color: #71372e;
  border: 1px solid #cba99b;
}

.remove-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.empty-state,
.message {
  text-align: center;
  padding: 75px 24px;
  background: #fffaf6;
  border: 1px dashed #e0c6b8;
  border-radius: 22px;
}

.empty-icon {
  font-size: 60px;
  color: #9b4963;
}

.empty-state h2,
.message h2 {
  margin-bottom: 10px;
}

.empty-state p,
.message p {
  color: #84675e;
  margin-bottom: 25px;
}
</style>
