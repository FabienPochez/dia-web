<template>
  <div class="min-h-screen bg-neutral-800 ">
    <!-- Header -->
   

    <!-- 3 Columns Layout -->
    <div class="flex flex-col lg:flex-row lg:justify-start gap-4 px-4 py-[1vh] lg:h-screen">
      <!-- Left Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col lg:justify-start gap-4 text-neutral-950">
        <SimplePlayer />
        
        <card id="logo-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
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

      <!-- Center Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col gap-4 lg:justify-start">
        <LiveCard />
        
        <WhatsNext />
        
        <card id="gimmick-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
            <card-content>
              <p class="text-white text-sm">Who cares for algorythms anyway.</p>
            </card-content>
          </card>
        <card id="logo-card-smiley" class="bg-neutral-900 border border-neutral-700 rounded-lg shadow">
          <card-content>
            <AnimatedLogo />
        </card-content>
        </card>
      </div>

      <!-- Right Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col lg:justify-start">
        <PodcastList :on-episode-click="(slug) => slug && router.push(`/episodes/${slug}`)" />
      </div>
    </div>

    <!-- Episode modal (shareable /episodes/:slug) -->
    <EpisodeModal
      :open="isEpisodeModalOpen"
      :episode="selectedEpisode"
      :episode-not-found="episodeNotFound"
      @close="handleEpisodeModalClose"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Instagram, Bird, Facebook, Music } from 'lucide-vue-next'
import LiveCard from './live/LiveCard.vue'
import WhatsNext from './live/WhatsNext.vue'
import SimplePlayer from './player/SimplePlayer.vue'
import PodcastList from './podcast/PodcastList.vue'
import AnimatedLogo from './shared/AnimatedLogo.vue'
import EpisodeModal from './episodes/EpisodeModal.vue'
import { useEpisodes } from '@/composables/useEpisodes'
import { fetchEpisodeBySlug } from '@/api/payload/episodes'

const route = useRoute()
const router = useRouter()
const { items, fetchEpisodes, findEpisodeBySlug } = useEpisodes()

const selectedEpisode = ref(null)
const isEpisodeModalOpen = ref(false)
const episodeNotFound = ref(false)

watch(
  () => route.params.slug,
  async (slug) => {
    if (!slug) {
      isEpisodeModalOpen.value = false
      selectedEpisode.value = null
      episodeNotFound.value = false
      return
    }
    // Ensure episodes list is loaded (reuse existing logic)
    if (items.value.length === 0) {
      await fetchEpisodes(1)
    }
    const found = findEpisodeBySlug(slug)
    if (found) {
      selectedEpisode.value = found
      episodeNotFound.value = false
      isEpisodeModalOpen.value = true
    } else {
      const episode = await fetchEpisodeBySlug(slug)
      if (episode) {
        selectedEpisode.value = episode
        episodeNotFound.value = false
        isEpisodeModalOpen.value = true
      } else {
        selectedEpisode.value = null
        episodeNotFound.value = true
        isEpisodeModalOpen.value = true
      }
    }
  },
  { immediate: true }
)

function handleEpisodeModalClose() {
  router.replace('/')
  isEpisodeModalOpen.value = false
  selectedEpisode.value = null
  episodeNotFound.value = false
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

