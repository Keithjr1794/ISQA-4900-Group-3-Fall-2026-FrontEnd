
<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">✦ RATE MY RESTAURANT</span>

        <h1>
          Discover your next
          <em>favorite</em> restaurant.
        </h1>

        <p class="hero-description">
          Explore local favorites, share honest reviews,
          and save the places you can't wait to try.
        </p>

        <router-link to="/restaurants" class="browse-button">
          Browse Restaurants →
        </router-link>
      </div>

      <div class="hero-accent" aria-hidden="true">
        <div class="accent-circle circle-one"></div>
        <div class="accent-circle circle-two"></div>
        <div class="accent-circle circle-three"></div>
      </div>
    </section>

    <section class="welcome-section">
      <span class="section-label">WELCOME</span>

      <h2>Great food. Great memories.</h2>

      <p>
        Your next favorite dining experience starts here.
        Discover new restaurants, share your experiences,
        and keep track of the places you love.
      </p>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px 90px;
  color: #392723;
}

/* Main hero banner */
.hero {
  display: grid;
  grid-template-columns: 1fr 0.35fr;
  min-height: 420px;
  background: linear-gradient(
    120deg,
    #52242e 0%,
    #713746 55%,
    #914d59 100%
  );
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(82, 36, 46, 0.15);
  position: relative;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: clamp(35px, 5vw, 70px);
}

.eyebrow {
  color: #f2d4a4;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2.5px;
}

.hero h1 {
  max-width: 730px;
  margin: 24px 0;
  color: #ffffff;
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -1.5px;
}

.hero h1 em {
  color: #f5d5aa;
  font-family: Georgia, serif;
  font-weight: 400;
}

.hero-description {
  max-width: 570px;
  margin: 0;
  color: #f6e7df;
  font-size: 17px;
  line-height: 1.8;
}

.browse-button {
  display: inline-block;
  margin-top: 30px;
  padding: 14px 24px;
  background: #f5d5aa;
  color: #52242e;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  transition: 0.2s ease;
}

.browse-button:hover {
  background: #fff0d9;
  transform: translateY(-2px);
}

.browse-button:focus-visible {
  outline: 3px solid white;
  outline-offset: 4px;
}

/* Subtle decorative accents */
.hero-accent {
  position: relative;
  overflow: hidden;
}

.accent-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 232, 210, 0.2);
}

.circle-one {
  width: 350px;
  height: 350px;
  top: -110px;
  right: -130px;
  background: rgba(255, 224, 190, 0.06);
}

.circle-two {
  width: 230px;
  height: 230px;
  bottom: -100px;
  right: 50px;
  background: rgba(255, 224, 190, 0.05);
}

.circle-three {
  width: 110px;
  height: 110px;
  top: 45%;
  right: 15%;
  background: rgba(255, 224, 190, 0.04);
}

/* Welcome section */
.welcome-section {
  padding: 75px 24px 30px;
  text-align: center;
}

.section-label {
  color: #bd855c;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 3px;
}

.welcome-section h2 {
  margin: 16px 0;
  color: #71372e;
  font-family: Georgia, serif;
  font-size: clamp(28px, 4vw, 42px);
}

.welcome-section p {
  max-width: 620px;
  margin: 0 auto;
  color: #735c50;
  font-size: 17px;
  line-height: 1.8;
}

/* Mobile */
@media (max-width: 760px) {
  .home-page {
    padding: 20px 15px 60px;
  }

  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-content {
    padding: 40px 28px;
  }

  .hero h1 {
    font-size: clamp(34px, 8vw, 48px);
  }

  .hero-accent {
    display: none;
  }

  .welcome-section {
    padding: 55px 10px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .browse-button {
    transition: none;
  }
}
</style>
