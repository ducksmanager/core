import AuthorCard from '~/components/AuthorCard'

export default {
  title: 'AuthorCard',
}

const Template = (args) => ({
  components: { AuthorCard },
  setup() {
    return { args }
  },
  template: '<div class="row" style="height: 200px"><AuthorCard v-bind="args" /></div>',
})
export const Default = Template.bind({})
Default.args = {
  enabled: true,
  selectable: true,
  author: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
}

export const NotEnabled = Template.bind({})
NotEnabled.args = {
  enabled: false,
  selectable: false,
  author: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
}

export const NotSelectable = Template.bind({})
NotSelectable.args = {
  enabled: true,
  selectable: false,
  author: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
}
