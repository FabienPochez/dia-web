<template>
  <div class="min-h-screen bg-neutral-400 ">
    <!-- Grid Layout -->
    <div class="grid-container grid grid-cols-1 lg:grid-cols-[350px_350px_350px] gap-4 px-4 py-[8vh] lg:h-screen lg:overflow-y-auto items-start">
      <!-- Left Column Items -->
      <card id="logo-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
        <card-content>
          <img src="/img/DIA-LOGO-H-B.gif" alt="DIA! Radio" class="invert" />
        </card-content>
      </card>

      <card id="message-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
        <card-content>
          <h1 class="text-lg text-white uppercase font-semibold mb-2">New App & website coming very soon!</h1>
          <p class="text-white text-sm">Stay tuned for a whole new experience!</p>
        </card-content>
      </card>

      <card id="baseline-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
        <card-content>
          <p class="text-white text-sm">Music curated by humans, for humans.</p>
        </card-content>
      </card>

      <card id="social-card" class="bg-neutral-900 text-white p-4 rounded-lg border border-neutral-700 shadow">
        <card-content>
          <h3 class="text-lg text-white uppercase font-semibold mb-2">Follow us</h3>
          <div class="flex flex-col gap-2">
            <a 
              href="https://www.instagram.com/dia.radio/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
            >
              <Instagram class="w-5 h-5" />
              <span>Instagram</span>
            </a>

            <a 
              href="https://www.facebook.com/dia.webradio/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
            >
              <Facebook class="w-5 h-5" />
              <span>Facebook</span>
            </a>
            <a 
              href="https://soundcloud.com/diaradio" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
            >
              <Music class="w-5 h-5" />
              <span>SoundCloud</span>
            </a>
          </div>
        </card-content>
      </card>

      <!-- Center Column Items -->
      <LiveCard />

      <SimplePlayer />

      <card id="gimmick-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
        <card-content>
          <p class="text-white text-sm">Who cares for algorythms anyway.</p>
        </card-content>
      </card>

      <card id="logo-card-smiley" class="bg-neutral-900 border border-neutral-700 rounded-lg shadow">
        <card-content>
          <img src="/img/Logo-Dia-bouge.gif" alt="DIA! Radio" />
        </card-content>
      </card>

      <!-- Right Column Item -->
      <WhatsNext />
    </div>
  </div>
</template>

<script setup>
import { Instagram, Bird, Facebook, Music } from 'lucide-vue-next'
import LiveCard from './live/LiveCard.vue'
import WhatsNext from './live/WhatsNext.vue'
import SimplePlayer from './player/SimplePlayer.vue'
</script>

<style scoped>
/* Custom scrollbar for grid container */
.grid-container::-webkit-scrollbar {
  width: 6px;
}

.grid-container::-webkit-scrollbar-track {
  background: transparent;
}

.grid-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.grid-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

