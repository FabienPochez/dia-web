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
        <!-- Privacy Policy Content Card -->
        <card id="privacy-content-card" class="bg-neutral-900 p-6 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h2 class="text-2xl text-white uppercase font-semibold mb-4">Privacy Policy</h2>
            <div class="text-white text-sm space-y-6">
              <p class="text-neutral-400 italic">
                <strong>Last updated:</strong> February 6, 2026
              </p>

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">1. Introduction</h3>
                <p>
                  DIA! Radio ("DIA!", "we", "us") respects your privacy and is committed to protecting your personal data.
                </p>
                <p>
                  This Privacy Policy explains how we collect, use, and delete information when you use the <strong>DIA! Radio mobile application, the website diaradio.live, and related services</strong> (the "Service").
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">2. What DIA! Radio Is</h3>
                <p>
                  DIA! Radio is a <strong>human-curated, editorial online radio service</strong> offering live broadcasts and replay episodes.
                </p>
                <p>
                  The Service does not allow users to upload content, publish comments, or interact publicly with other users.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">3. Data We Collect</h3>
                
                <div class="mt-4">
                  <h4 class="text-lg text-white font-semibold mb-2">a. Data you provide</h4>
                  <p class="mb-2">When you create an account, we collect:</p>
                  <ul class="list-disc list-inside ml-4 space-y-1 mb-2">
                    <li>Email address</li>
                    <li>Account identifier</li>
                    <li>Favorites (saved episodes)</li>
                  </ul>
                  <p>This data is used <strong>only</strong> to provide account-related features.</p>
                </div>

                <div class="mt-4">
                  <h4 class="text-lg text-white font-semibold mb-2">b. Data collected automatically</h4>
                  <p>
                    We collect limited, anonymized usage data to understand how the Service is used and to improve performance and stability.
                  </p>
                  <p>
                    This data is processed using <strong>PostHog</strong>, strictly for product analytics and service improvement.
                  </p>
                </div>

                <div class="mt-4">
                  <h4 class="text-lg text-white font-semibold mb-2">c. Data we do <strong>not</strong> collect</h4>
                  <p class="mb-2">We do <strong>not</strong> collect:</p>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>Precise location data</li>
                    <li>Contacts</li>
                    <li>Photos or media</li>
                    <li>Payment or financial data</li>
                    <li>Advertising identifiers</li>
                    <li>Sensitive personal data</li>
                  </ul>
                </div>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">4. Analytics</h3>
                <p>Analytics are used solely to improve the Service.</p>
                <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>We do <strong>not</strong> use data for advertising</li>
                  <li>We do <strong>not</strong> track users across other apps or websites</li>
                  <li>We do <strong>not</strong> sell personal data</li>
                </ul>
                <p class="mt-2">
                  If cross-app or advertising-related tracking is introduced in the future, users will be clearly informed and asked for consent where required by law.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">5. How We Use Your Data</h3>
                <p class="mb-2">We use your data only to:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Create and manage user accounts</li>
                  <li>Enable optional features such as favorites</li>
                  <li>Maintain security and prevent abuse</li>
                  <li>Improve the Service through anonymized analytics</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">6. Account Deletion</h3>
                <p>
                  You can delete your account <strong>directly from within the mobile application</strong>.
                </p>
                <p class="mt-2 mb-2">When an account is deleted:</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>The account is immediately deactivated</li>
                  <li>All associated personal data is permanently deleted</li>
                  <li>No personal data is retained</li>
                </ul>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">7. Data Retention</h3>
                <p>
                  Personal data is retained <strong>only for as long as your account exists</strong>.
                </p>
                <p class="mt-2">
                  Once an account is deleted, associated data is removed without delay.
                </p>
                <p class="mt-2">
                  Anonymous analytics data may be retained for statistical and operational purposes.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">8. Data Sharing</h3>
                <p>We do not sell personal data.</p>
                <p class="mt-2">
                  Data may be processed by trusted service providers (such as analytics providers) solely to operate and improve the Service, under appropriate confidentiality and data protection obligations.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">9. Emails & Communications</h3>
                <p class="mb-2">We may send emails related to:</p>
                <ul class="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>Account creation</li>
                  <li>Password resets</li>
                  <li>Account deletion confirmations</li>
                </ul>
                <p>We do not send marketing emails at this time.</p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">10. Children's Privacy</h3>
                <p>The Service is not specifically directed at children.</p>
                <p class="mt-2">We do not knowingly collect personal data from children.</p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">11. International Use</h3>
                <p>DIA! Radio is available internationally.</p>
                <p class="mt-2">
                  By using the Service, you understand that your data may be processed in accordance with this Privacy Policy.
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">12. Contact</h3>
                <p class="mb-2">For any privacy-related questions or requests, you may contact us at:</p>
                <p class="mb-4">
                  📧 <a href="mailto:contact@diaradio.live" class="text-white underline hover:opacity-80 transition-opacity"><strong>contact@diaradio.live</strong></a>
                </p>
                <p class="mb-2">To report inappropriate content:</p>
                <p>
                  📧 <a href="mailto:report@diaradio.live" class="text-white underline hover:opacity-80 transition-opacity"><strong>report@diaradio.live</strong></a>
                </p>
              </section>

              <hr class="border-neutral-700" />

              <section>
                <h3 class="text-xl text-white uppercase font-semibold mb-3">13. Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time.</p>
                <p class="mt-2">
                  Any changes will be published on diaradio.live and will apply from the date of publication.
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
