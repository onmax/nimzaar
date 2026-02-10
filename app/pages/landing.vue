<script setup lang="ts">
useHead({ title: 'Nimzaar — Own your digital shelf' })

definePageMeta({ layout: false })
</script>

<template>
  <div class="v1">
    <!-- Hero -->
    <section class="hero">
      <BitsNoise :pattern-alpha="15" mix-blend-mode="overlay" />
      <div class="hero-inner">
        <img src="/images/v1-logo.png" alt="Nimzaar" class="logo">
        <h1 class="headline">
          <BitsDecryptedText text="Own your digital shelf." animate-on="view" :speed="50" :sequential="true" />
        </h1>
        <p class="sub">The crypto-native marketplace for digital goods. No middlemen. No passwords. Just NIM.</p>
        <NuxtLink to="/products" class="cta">Enter the Bazaar</NuxtLink>
        <img src="/images/v1-hero.png" alt="Nimzaar hero" class="hero-img">
      </div>
    </section>

    <!-- What is Nimzaar -->
    <section class="section">
      <div class="container">
        <BitsGlitchText :children="'What is Nimzaar?'" :enable-on-hover="true" :speed="0.5" class-name="v1-glitch-title" />
        <p class="section-body">A digital marketplace built into Nimiq Pay. Creators list. Buyers pay with NIM. Files deliver instantly. That's it.</p>
      </div>
    </section>

    <!-- How it Works -->
    <section class="section">
      <div class="container">
        <h2 class="section-heading">How it works</h2>
        <div class="steps">
          <div class="step">
            <span class="step-num">01</span>
            <h3 class="step-title">Open Nimiq Pay</h3>
            <p class="step-desc">Launch the app you already have.</p>
          </div>
          <div class="step">
            <span class="step-num">02</span>
            <h3 class="step-title">Browse digital products</h3>
            <p class="step-desc">Explore links, PDFs, and digital goods.</p>
          </div>
          <div class="step">
            <span class="step-num">03</span>
            <h3 class="step-title">Pay with NIM, get it instantly</h3>
            <p class="step-desc">One tap. No sign-ups. Delivered on payment.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="section">
      <div class="container">
        <h2 class="section-heading">Why Nimzaar</h2>
        <div class="benefits">
          <div class="benefit">
            <h3 class="benefit-title">Instant Payments</h3>
            <p class="benefit-desc">NIM settles in seconds. No waiting.</p>
          </div>
          <div class="benefit">
            <h3 class="benefit-title">No Accounts</h3>
            <p class="benefit-desc">Your wallet is your identity.</p>
          </div>
          <div class="benefit">
            <h3 class="benefit-title">Digital Delivery</h3>
            <p class="benefit-desc">Links and files, delivered on payment.</p>
          </div>
          <div class="benefit">
            <h3 class="benefit-title">Sovereignty</h3>
            <p class="benefit-desc">Your keys. Your purchases. Your data.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="section footer-cta">
      <div class="container footer-cta-inner">
        <h2 class="footer-headline">
          <BitsDecryptedText text="Ready to own your shelf?" animate-on="view" :speed="50" :sequential="true" />
        </h2>
        <NuxtLink to="/products" class="cta">Launch Nimzaar</NuxtLink>
        <p class="powered">Powered by Nimiq</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

.v1 {
  --bg: hsl(230, 15%, 8%);
  --gold: hsl(45, 95%, 55%);
  --white: #f0f0f0;
  --muted: #8a8a9a;

  background: var(--bg);
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-top: 0;
  padding: 0;
}

/* Noise canvas — component uses Tailwind classes that don't exist here */
.hero :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

/* GlitchText — override Tailwind-dependent styles */
.v1 :deep(.v1-glitch-title) {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: clamp(1.5rem, 3vw, 2.25rem) !important;
  font-weight: 900;
  color: var(--white);
  position: relative;
  display: inline-block;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0 0;
}

.v1 :deep(.v1-glitch-title)::before,
.v1 :deep(.v1-glitch-title)::after {
  background: var(--bg) !important;
  color: var(--white);
}

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  padding: 80px 24px 60px;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid var(--gold);
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  gap: 24px;
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.headline {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--white);
  margin: 0;
}

.sub {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--muted);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}

.cta {
  display: inline-block;
  background: var(--gold);
  color: var(--bg);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border: none;
  border-radius: 0;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.15s, transform 0.15s;
}

.cta:hover {
  background: #d4a02a;
  transform: translateY(-1px);
}

.hero-img {
  width: 100%;
  max-width: 600px;
  margin-top: 16px;
  border: 2px solid var(--gold);
}

/* Sections */
.section {
  padding: 80px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.container {
  max-width: 1080px;
  margin: 0 auto;
}

.section-heading {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  margin: 0 0 48px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-body {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--muted);
  line-height: 1.7;
  max-width: 640px;
  margin: 32px 0 0;
}

/* Steps */
.steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.step {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 32px;
}

.step-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
  display: block;
  margin-bottom: 16px;
}

.step-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px;
}

.step-desc {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

/* Benefits */
.benefits {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.benefit {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 36px 32px;
}

.benefit-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--gold);
}

.benefit-desc {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

/* Footer CTA */
.footer-cta {
  border-bottom: none;
  padding: 100px 24px;
}

.footer-cta-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.footer-headline {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0;
}

.powered {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 16px 0 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Desktop */
@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }

  .benefits {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .benefits {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
