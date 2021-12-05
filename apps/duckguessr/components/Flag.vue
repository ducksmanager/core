<template>
  <b-img :src="url" />
</template>

<script>
export default {
  name: 'Flag',
  props: {
    country: {
      type: String,
      required: true,
    },
  },
  setup({ country }) {
    let fixedCountry = country
    switch (country) {
      case 'uk':
        fixedCountry = 'gb'
    }
    return {
      url: `https://flagcdn.com/w20/${fixedCountry}.png`,
    }
  },
}
</script>

<style scoped></style>
