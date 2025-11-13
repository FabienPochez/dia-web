<template>
  <div class="min-h-screen bg-neutral-950 text-white">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">DIA! Radio</h1>
        <p class="text-gray-400">Coming soon</p>
      </div>

      <!-- Live Card -->
      <div class="mb-8">
        <LiveCard />
      </div>

      <!-- What's Next -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">What's Next</h2>
        <WhatsNext />
      </div>
    </div>

    <!-- Simple Player (fixed at bottom) -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-neutral-950/95 backdrop-blur border-t border-neutral-800">
      <SimplePlayer />
    </div>
  </div>
</template>

<script setup>
import LiveCard from './live/LiveCard.vue'
import WhatsNext from './live/WhatsNext.vue'
import SimplePlayer from './player/SimplePlayer.vue'
</script>

