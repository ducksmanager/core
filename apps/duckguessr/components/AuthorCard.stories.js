import AuthorCard from '~/components/AuthorCard'

export default {
  title: 'AuthorCard',
}

const Template = (args) => ({
  components: { AuthorCard },
  setup() {
    return { args }
  },
  template:
    '<div class="row" style="height: 200px"><AuthorCard v-bind="args" /></div>',
})
export const Default = Template.bind({})
Default.args = {
  selectable: true,
  selected: true,
  author: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
}
