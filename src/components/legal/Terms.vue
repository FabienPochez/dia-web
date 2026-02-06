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
        <!-- Terms of Service Content Card -->
        <card id="terms-content-card" class="bg-neutral-900 p-6 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h2 class="text-2xl text-white uppercase font-semibold mb-4">Terms of Service</h2>
            <div class="text-white text-sm space-y-6">
              <p class="text-neutral-400 italic">
                <strong>Last updated:</strong> February 6, 2026
              </p>

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">1. Introduction</h3>
                <p>
                  These Terms of Service ("Terms") govern your use of the <strong>DIA! Radio mobile application, the website diaradio.live, and related services</strong> ("DIA!", "the Service", "we", "us").
                </p>
                <p class="mt-2">
                  By accessing or using the Service, you agree to these Terms.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">2. The Service</h3>
                <p>
                  DIA! Radio is a <strong>human-curated, editorial online radio service</strong> offering live broadcasts and replayed audio content via its mobile application and website.
                </p>
                <p class="mt-2">
                  The Service does not allow users to upload content, publish comments, or interact publicly with other users.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">3. Access & Accounts</h3>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>The Service can be used <strong>without creating an account</strong></li>
                  <li>Creating an account is optional and enables additional features (such as saving favorites)</li>
                  <li>You are responsible for keeping your login credentials secure</li>
                  <li>You must provide accurate and truthful information when creating an account</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">4. Account Deletion</h3>
                <p>
                  You may delete your account at any time from within the mobile application.
                </p>
                <p class="mt-2 mb-2">When an account is deleted:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Access to account-related features ends immediately</li>
                  <li>Associated personal data is permanently deleted, as described in our Privacy Policy</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">5. Content</h3>
                <p class="mb-2">All content available through the Service is:</p>
                <ul class="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>Curated and selected by the DIA! team</li>
                  <li>Provided for personal listening only</li>
                  <li>Protected by intellectual property rights</li>
                </ul>
                <p>
                  You may not copy, redistribute, record, or commercially exploit the content without prior authorization from the rights holders.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">6. Availability</h3>
                <p>
                  We strive to keep the Service available and reliable, but we do not guarantee uninterrupted or error-free access.
                </p>
                <p class="mt-2 mb-2">DIA! Radio may:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Modify, suspend, or discontinue parts of the Service</li>
                  <li>Update, replace, or remove content</li>
                  <li>Temporarily interrupt access for maintenance or technical reasons</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">7. Acceptable Use</h3>
                <p class="mb-2">You agree not to:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Attempt to disrupt or misuse the Service</li>
                  <li>Access the Service in an unlawful or abusive manner</li>
                  <li>Circumvent technical limitations or security measures</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">8. Reporting Content</h3>
                <p class="mb-2">If you believe any content available through the Service is inappropriate or unlawful, you may report it at:</p>
                <p>
                  📧 <a href="mailto:report@diaradio.live" class="text-white underline hover:opacity-80 transition-opacity"><strong>report@diaradio.live</strong></a>
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">9. Limitation of Liability</h3>
                <p class="mb-2">To the extent permitted by law, DIA! Radio shall not be liable for:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Temporary service interruptions or technical issues</li>
                  <li>Loss of data resulting from account deletion requested by the user</li>
                  <li>Indirect or consequential damages related to use of the Service</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">10. Changes to the Terms</h3>
                <p>We may update these Terms from time to time.</p>
                <p class="mt-2">
                  Any changes will be published on diaradio.live and will apply from the date of publication.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">11. Contact</h3>
                <p class="mb-2">For questions about these Terms or the Service, you can contact us at:</p>
                <p>
                  📧 <a href="mailto:contact@diaradio.live" class="text-white underline hover:opacity-80 transition-opacity"><strong>contact@diaradio.live</strong></a>
                </p>
              </section>
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
