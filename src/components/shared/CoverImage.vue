<template>
  <img
    :src="src"
    alt="Cover"
    class="h-full aspect-square object-cover "
  />
</template>

<script setup>
defineProps({
  src: String
})
</script>

