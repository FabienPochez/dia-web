<template>
  <div class="relative w-full" style="aspect-ratio: 1 / 1;">
    <transition name="fade" mode="out-in">
      <img
        :key="currentIndex"
        :src="images[currentIndex]"
        alt="DIA! Radio"
        class="absolute inset-0 w-full h-full object-contain opacity-80"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const images = [
  '/img/DIA_SIGLE_01.png',
  '/img/DIA_SIGLE_02.png',
  '/img/DIA_SIGLE_03.png'
]

const currentIndex = ref(0)
let intervalId = null

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

onMounted(() => {
  // Change image every 15 seconds
  intervalId = setInterval(nextImage, 15000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
