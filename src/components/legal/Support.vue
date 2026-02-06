<template>
  <div class="min-h-screen bg-neutral-800 ">
    <!-- 2 Columns Layout -->
    <div class="flex flex-col lg:flex-row lg:justify-start gap-4 px-4 py-[1vh] lg:h-screen">
      <!-- Left Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col lg:justify-start gap-4 text-neutral-950">
        <card id="logo-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow cursor-pointer hover:opacity-90 transition-opacity" @click="goHome">
          <card-content>
            <img src="/img/DIA-LOGO-ALT.svg" alt="DIA! Radio" />
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
      </div>

      <!-- Center Column (Wider - spans 2 column spaces) -->
      <div class="flex-shrink-0 w-full lg:w-[700px] overflow-y-auto flex flex-col gap-4 lg:justify-start">
        <!-- Support Content Card -->
        <card id="support-content-card" class="bg-neutral-900 p-6 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h2 class="text-2xl text-white uppercase font-semibold mb-4">Need help?</h2>
            <div class="text-white text-sm space-y-4">
              <p>
                For any questions, feedback, or issues with the DIA! app,
                please contact us at:
              </p>
              <p class="text-lg">
                📧 <a href="mailto:support@diaradio.live" class="text-white underline hover:opacity-80 transition-opacity"><strong>support@diaradio.live</strong></a>
              </p>
            </div>
          </card-content>
        </card>

        <!-- Gimmick Card -->
        <card id="gimmick-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <p class="text-white text-sm">Who cares for algorythms anyway.</p>
          </card-content>
        </card>

        <!-- Logo Smiley Card -->
        <card id="logo-card-smiley" class="bg-neutral-900 border border-neutral-700 rounded-lg shadow cursor-pointer hover:opacity-90 transition-opacity" @click="goHome">
          <card-content>
            <AnimatedLogo />
          </card-content>
        </card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Instagram, Facebook, Music } from 'lucide-vue-next'
import AnimatedLogo from '../shared/AnimatedLogo.vue'

const router = useRouter()

// Navigate to home
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* Custom scrollbar for columns */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
