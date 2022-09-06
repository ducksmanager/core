<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a @click="generateSprites()" href="javascript:void(0)">Generate sprites</a>
</template>

<script setup>
import axios from 'axios'

let bookstores = $ref(null)

const generateSprites = async () => {
  await axios.post('/edgecreator/edgesprites')
}

</script>
