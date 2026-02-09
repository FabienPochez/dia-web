<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent
      class="sm:max-w-lg bg-neutral-900 border-neutral-700 text-white max-h-[90vh] overflow-y-auto"
      @escapeKeyDown="handleClose"
      @pointerDownOutside="handleClose"
    >
      <DialogHeader>
        <DialogTitle class="sr-only">Episode details</DialogTitle>
      </DialogHeader>
      <EpisodeModalContent
        v-if="episode"
        :episode="episode"
        :is-loading="false"
        @close="handleClose"
      />
      <div v-else-if="episodeNotFound" class="py-8 text-center text-neutral-400">
        <p>Episode not found.</p>
        <Button variant="outline" class="mt-4" @click="handleClose">Close</Button>
      </div>
      <div v-else class="py-8 text-center">
        <Skeleton class="h-48 w-full rounded-lg mb-4" />
        <Skeleton class="h-4 w-3/4 mx-auto" />
        <Skeleton class="h-4 w-1/2 mx-auto mt-2" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EpisodeModalContent from './EpisodeModalContent.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  episode: { type: Object, default: null },
  episodeNotFound: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function onOpenChange(value) {
  if (!value) handleClose()
}

function handleClose() {
  emit('close')
}
</script>
