<template>
  <section class="welcome">
    <h1>Welcome to Rate My Restaurant</h1>

    <p>
      Discover restaurants, share your experiences,
      and save places you want to visit.
    </p>

    <router-link to="/restaurants">
      Browse Restaurants
    </router-link>
  </section>
</template>

<style scoped>
.welcome {
  padding: 100px 24px;
  text-align: center;
}

h1 {
  max-width: 800px;
  margin: 0 auto;
  color: #71372e;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.2;
}

p {
  max-width: 550px;
  margin: 24px auto;
  color: #735c50;
  font-size: 18px;
  line-height: 1.7;
}

a {
  display: inline-block;
  padding: 12px 20px;
  background: #71372e;
  color: #f7eee3;
  border-radius: 5px;
  text-decoration: none;
}

a:hover {
  background: #582a23;
}
</style>