<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="steps.length" id="wrapper" fluid>
    <top-bar />
    <b-row class="flex-grow-1 pt-2">
      <b-col class="text-right">
        <table class="edges">
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber" />
            </td>
            <td v-for="issuenumber in issuenumbers" :key="issuenumber">
              <edge-canvas :issuenumber="issuenumber" :steps="steps" />
            </td>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <th v-for="issuenumber in issuenumbers" :key="issuenumber">
              {{ issuenumber }}<br />&#11088;
            </th>
            <th v-if="showNextEdge && edgesAfter.length">
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <model-edit
          :steps="steps"
          @add-step="
            (component) => {
              steps.push({
                component: component,
                svgGroupElement: null,
              })
            }
          "
        />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'

import TopBar from '~/components/TopBar'
import EdgeCanvas from '~/components/EdgeCanvas'
import PublishedEdge from '~/components/PublishedEdge'
import ModelEdit from '~/components/ModelEdit'

const DOMParser = require('xmldom').DOMParser

export default {
  components: {
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
  },
  data() {
    return {
      error: null,
      steps: [],
    }
  },
  computed: {
    zoom: {
      get() {
        return this.$store.state.zoom
      },
      set(value) {
        this.$store.commit('setZoom', value)
      },
    },
    ...mapState(['country', 'magazine', 'issuenumbers', 'edgesBefore', 'edgesAfter']),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('ui', ['showIssueNumbers', 'showPreviousEdge', 'showNextEdge']),
  },
  watch: {
    async issuenumbers(newValue) {
      if (newValue) {
        this.loadGalleryItems()
        this.loadSurroundingEdges()
      }
    },
  },
  async mounted() {
    const vm = this
    const [country, magazine, issuenumberMin, , issuenumberMax] = vm.$route.params.pathMatch.split(
      '/'
    )
    if ([country, magazine, issuenumberMin].includes(undefined)) {
      this.error = 'Invalid URL'
      return
    }
    this.setCountry(country)
    this.setMagazine(magazine)
    this.setEditIssuenumber(issuenumberMin)

    await this.loadPublicationIssues()

    this.setIssuenumbersFromMinMax({ min: issuenumberMin, max: issuenumberMax })

    await this.$axios
      .$get(this.getEdgeUrl(issuenumberMin, 'svg'))
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, 'image/svg+xml')
        const svgElement = doc.getElementsByTagName('svg')[0]
        vm.setDimensions({
          width: svgElement.getAttribute('width') / 1.5,
          height: svgElement.getAttribute('height') / 1.5,
        })

        vm.steps = Object.values(svgElement.childNodes)
          .filter((group) => group.nodeName === 'g')
          .map((group) => ({
            component: group.getAttribute('class'),
            svgGroupElement: group,
          }))
      })
      .catch(async () => {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumberMin}`
        )
        if (!edge) {
          return
        }
        const steps = await vm.$axios.$get(`/api/edgecreator/v2/model/${edge.id}/steps`)

        const dimensions = steps.find((step) => step.ordre === -1)
        if (dimensions) {
          vm.setDimensions({
            width: dimensions.options.Dimension_x,
            height: dimensions.options.Dimension_y,
          })
        }

        vm.steps = steps
          .filter((step) => step.ordre !== -1)
          .map((step) => ({
            component: vm.supportedRenders.find(
              (component) => component.originalName === step.nomFonction
            ).component,
            dbOptions: step.options,
          }))
      })
  },
  methods: {
    getEdgeUrl(issuenumber, extension = 'png') {
      return (
        `${process.env.EDGES_URL}/${this.country}/gen/` +
        `${this.magazine}.${issuenumber}.${extension}`
      )
    },
    ...mapMutations(['setDimensions', 'setCountry', 'setMagazine']),
    ...mapMutations('editingStep', { setEditIssuenumber: 'setIssuenumber' }),
    ...mapActions([
      'setIssuenumbersFromMinMax',
      'loadPublicationIssues',
      'loadSurroundingEdges',
      'loadGalleryItems',
    ]),
  },
  middleware: 'authenticated',
}
</script>
<style>
#wrapper {
  display: flex;
  flex-direction: column;
  user-select: none;
}
table.edges {
  float: right;
}

table.edges tr td,
table.edges tr th {
  padding: 0;
  text-align: center;
}

table.edges tr td {
  vertical-align: bottom;
}

table.edges tr th {
  vertical-align: top;
  outline: 1px solid grey;
}
</style>
