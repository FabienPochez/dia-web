<template>
  <Card class="w-full text-white rounded-none bg-transparent border-b border-t-0 border-r-0 border-l-0 border-neutral-500 py-0 gap-0">
    <CardContent class="p-0">
      <!-- Image skeleton -->
      <div class="relative aspect-3/2 w-full overflow-hidden rounded-lg">
        <Skeleton class="w-full h-full" />
      </div>
      
      <!-- Date skeleton -->
      <div class="pt-3">
        <Skeleton class="h-3 w-20" />
      </div>
      
      <!-- Title skeleton -->
      <div class="pt-3">
        <Skeleton class="h-5 w-3/4" />
      </div>
      
      <!-- Genre badges skeleton -->
      <div class="pt-5 pb-2 flex gap-2">
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="h-5 w-20 rounded-full" />
        <Skeleton class="h-5 w-14 rounded-full" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

