<template>
  <b-card
    no-body
    class="mb-1"
    bg-variant="light"
    header-text-variant="dark"
  >
    <template #header>
      <div v-b-toggle="id">
        <slot name="header" />
      </div>
    </template>
    <b-collapse
      :id="id"
      :visible="visible"
      :accordion="accordionGroupId"
      role="tabpanel"
    >
      <b-card footer-text-variant="dark">
        <b-card-body>
          <b-card-text>
            <slot name="content" />
          </b-card-text>
        </b-card-body>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </b-card>
    </b-collapse>
  </b-card>
</template>
<script>
export default {
  name: 'Accordion',
  props: {
    accordionGroupId: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      required: true
    }
  },
  emits: ['expand']
}
</script>

<style scoped lang="scss">
::v-deep a {
  color: grey;
}

::v-deep .card-body {
  padding: 0.5rem;
}
</style>
