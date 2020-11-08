<template>
  <div>
    <div
      class="a2a_kit a2a_kit_size_32 a2a_default_style"
      :data-a2a-url="url"
      :data-a2a-title="title"
    >
      <a
        class="a2a_dd"
        href="https://www.addtoany.com/share"
      />
      <a
        v-for="platform in platforms"
        :key="platform"
        :class="{[`a2a_button_${platform}`]: true}"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "SharePage",
  props: {
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data: () => ({
    platforms: ['email', 'facebook', 'twitter', 'whatsapp']
  }),

  mounted() {
    console.log('mounted')
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = '//static.addtoany.com/menu/page.js'
    document.body.append(script)
  }
}
</script>

<style scoped lang="scss">
  a {
    border-bottom: none !important;
  }
</style>