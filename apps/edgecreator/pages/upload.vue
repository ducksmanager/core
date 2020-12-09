<template>
  <upload photo multiple />
</template>

<script>
import Upload from '@/components/Upload'

export default {
  components: {
    Upload,
  },
  middleware: 'authenticated',
}
</script>

<style scoped></style>
