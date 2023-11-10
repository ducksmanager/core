import DefaultLayout from '~/layouts/default'

export default {
  title: 'DefaultLayout',
}

const Template = (args) => ({
  components: { DefaultLayout },
  setup() {
    return { args }
  },
  template: '<DefaultLayout v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {}
