<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a @click="generateSprites()" href="javascript:void(0)">Generate sprites</a>
</template>

<script setup>
import axios from 'axios'
import Cookies from "js-cookie";

let bookstores = $ref(null)

const generateSprites = async () => {
  await axios.put('/edgecreator/edgesprites', null, {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  })
}

</script>
