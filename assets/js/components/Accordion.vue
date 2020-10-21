<template>
  <b-card
    no-body 
    class="mb-1"
  >
    <b-card-header
      header-tag="header"
      class="p-1"
      role="tab"
    >
      <b-button
        v-b-toggle="id"
        block
        variant="info"
      >
        <slot name="header" />
      </b-button>
    </b-card-header>
    <b-collapse
      :id="id"
      :visible="visible"
      :accordion="accordionGroupId"
      role="tabpanel"
      @input="$emit('expand')"
    >
      <b-card-body>
        <b-card-text>
          <slot name="content" />
        </b-card-text>
      </b-card-body>
      <b-card-footer><slot name="footer" /></b-card-footer>
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
