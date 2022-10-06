<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a @click="generateSprites()" href="javascript:void(0)">Generate sprites</a>
</template>

<script setup lang="ts">
import axios from 'axios'

const generateSprites = async () => {
  await axios.put('/edgecreator/edgesprites')
}

</script>
