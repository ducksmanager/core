<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left">
        <b-button v-b-toggle.sidebar>Toggle Options</b-button>
        <b-sidebar id="sidebar" v-model="showSidebar" title="Options" shadow>
          <b-container class="px-3 py-2">
            <b-row align-items="center">
              <b-col cols="6">
                Zoom
              </b-col>
              <b-col cols="2">{{ zoom }} </b-col>
              <b-col cols="4">
                <input
                  v-model="zoom"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  style="width: 100%"
              /></b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showIssueNumbers">Show issue numbers</label></b-col
              >
              <b-col>
                <b-checkbox id="showIssueNumbers" v-model="showIssueNumbers"
              /></b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showPreviousEdge">Show previous edge</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgesBefore.length"
              /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showNextEdge">Show next edge</label></b-col>
              <b-col>
                <b-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgesAfter.length"
              /></b-col> </b-row
          ></b-container>
        </b-sidebar>
      </b-col>
      <b-col align-self="center" class="col-sm-4">
        <b-button to="/"><b-icon-house /> Home</b-button>
      </b-col>
      <b-col />
    </b-row>
    <b-row align="center" class="p-2">
      <b-col align-self="center">
        <b-button
          id="export"
          v-b-tooltip.hover
          title="Export"
          pill
          variant="success"
          size="sm"
          @click="exportSvg"
          ><b-icon-archive-fill
        /></b-button>
      </b-col>
    </b-row>
    <b-row align="center" class="pb-2" style="border-bottom: 1px solid grey">
      <b-col align-self="center">
        <img :src="flagImageUrl" :alt="country" />&nbsp;{{ magazine }}&nbsp;{{
          issuenumbers[0]
        }}<span v-if="issuenumbers.length > 1">
          to {{ issuenumbers[issuenumbers.length - 1] }}</span
        >
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapState } from 'vuex'
import { BIconArchiveFill, BIconHouse } from 'bootstrap-vue'

export default {
  name: 'TopBar',
  components: {
    BIconHouse,
    BIconArchiveFill
  },
  data() {
    return {
      showSidebar: true
    }
  },
  computed: {
    zoom: {
      get() {
        return this.$store.state.zoom
      },
      set(value) {
        this.$store.commit('setZoom', value)
      }
    },
    showIssueNumbers: {
      get() {
        return this.$store.state.ui.showIssueNumbers
      },
      set(value) {
        this.$store.commit('ui/setShowIssueNumbers', value)
      }
    },
    showPreviousEdge: {
      get() {
        return this.$store.state.ui.showPreviousEdge
      },
      set(value) {
        this.$store.commit('ui/setShowPreviousEdge', value)
      }
    },
    showNextEdge: {
      get() {
        return this.$store.state.ui.showNextEdge
      },
      set(value) {
        this.$store.commit('ui/setShowNextEdge', value)
      }
    },
    flagImageUrl() {
      return `${process.env.DM_URL}/images/flags/${this.country}.png`
    },
    ...mapState([
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter'
    ])
  },
  methods: {
    exportSvg() {
      const vm = this
      this.zoom = 1.5
      vm.$nextTick().then(() => {
        vm.issuenumbers.forEach((issuenumber) => {
          vm.$axios
            .$put('/fs/export', {
              country: vm.country,
              magazine: vm.magazine,
              issuenumber,
              content:
                vm.$refs[vm.getEdgeCanvasRefId(issuenumber)][0].$refs.edge
                  .outerHTML
            })
            .then(() => {
              vm.$bvToast.toast('Export done', {
                toaster: 'b-toaster-top-center'
              })
            })
        })
      })
    }
  }
}
</script>

<style scoped></style>
