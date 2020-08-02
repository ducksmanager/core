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
                <input v-model="zoom" type="range" min="1" max="8" step="0.5" style="width: 100%;"
              /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showIssueNumbers">Show issue numbers</label></b-col>
              <b-col> <b-checkbox id="showIssueNumbers" v-model="showIssueNumbers" /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showPreviousEdge">Show previous edge</label></b-col>
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
                <b-checkbox id="showNextEdge" v-model="showNextEdge" :disabled="!edgesAfter.length"
              /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showEdgePhotos">Show edge photos</label></b-col>
              <b-col>
                <b-checkbox id="showEdgePhotos" v-model="showEdgePhotos" :disabled="!hasPhotoUrl"
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
          v-b-tooltip.hover
          v-b-toggle.collapse-dimensions
          title="Change dimensions"
          pill
          size="sm"
          variant="outline-primary"
          ><b-icon-arrows-angle-expand
        /></b-button>
        <b-collapse id="collapse-dimensions" class="mt-2">
          <dimensions :width="width" :height="height" @change="setDimensions" />
        </b-collapse>
        <b-button
          v-b-tooltip.hover
          title="Lock"
          pill
          :variant="locked ? 'primary' : 'outline-primary'"
          :disabled="issuenumbers.length === 1"
          size="sm"
          @click="locked = !locked"
          ><b-icon-lock v-if="locked" /><b-icon-unlock v-else
        /></b-button>
        <b-button
          v-b-tooltip.hover
          title="Edge photo"
          pill
          variant="outline-primary"
          :disabled="issuenumbers.length > 1"
          size="sm"
          @click="showPhotoModal = !showPhotoModal"
          ><b-icon-camera /><b-modal v-model="showPhotoModal" ok-only
            ><upload
              photo
              :edge="{
                country,
                magazine,
                issuenumber: issuenumbers[0],
              }" /></b-modal
        ></b-button>
        <b-spinner v-if="savePending" v-b-tooltip.hover variant="primary" />
        <b-button v-else-if="saveResult === 'success'" pill variant="outline-primary" size="sm">
          <b-icon-check />
        </b-button>
        <b-button v-else-if="saveResult === 'error'" pill variant="outline-danger" size="sm">
          <b-icon-x />
        </b-button>
        <b-button v-else title="Save" pill variant="outline-primary" size="sm" @click="save(false)"
          ><b-icon-archive
        /></b-button>

        <b-spinner v-if="exportPending" v-b-tooltip.hover variant="success" />
        <b-button v-else-if="exportResult === 'success'" pill variant="outline-success" size="sm">
          <b-icon-check />
        </b-button>
        <b-button v-else-if="exportResult === 'error'" pill variant="outline-danger" size="sm">
          <b-icon-x />
        </b-button>
        <b-button
          v-else
          v-b-tooltip.hover
          title="Export"
          pill
          variant="outline-success"
          size="sm"
          @click="showExportModal = !showExportModal"
          ><b-icon-cloud-arrow-up-fill /><b-modal
            v-model="showExportModal"
            title="Export"
            ok-only
            ok-title="Export"
            @ok="save(true)"
          >
            <div v-for="contributionType in ['photographers', 'designers']" :key="contributionType">
              <h2>{{ $t('export.' + contributionType) }}</h2>
              <vue-bootstrap-typeahead
                :ref="`${contributionType}-typeahead`"
                :data="allUsers.filter((user) => !contributors[contributionType].includes(user))"
                :serializer="(u) => u.username"
                :placeholder="$t('export.typeahead.placeholder')"
                :min-matching-chars="0"
                @hit="
                  addContributor({ contributionType: contributionType, user: $event })
                  $refs[`${contributionType}-typeahead`][0].inputValue = ''
                "
              />
              <ul>
                <li v-for="(user, i) in contributors[contributionType]" :key="user.username">
                  {{ user.username }}
                  <b-icon-x-square-fill
                    style="cursor: pointer;"
                    @click="removeContributor({ contributionType: contributionType, index: i })"
                  />
                </li>
              </ul></div></b-modal
        ></b-button>
      </b-col>
    </b-row>
    <b-row align="center" class="pb-2" style="border-bottom: 1px solid grey;">
      <b-col align-self="center">
        <img :src="flagImageUrl" :alt="country" />&nbsp;{{ magazine }}&nbsp;{{ issuenumbers[0]
        }}<span v-if="issuenumbers.length > 1">
          to {{ issuenumbers[issuenumbers.length - 1] }}</span
        >
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import {
  BIconArchive,
  BIconArrowsAngleExpand,
  BIconCamera,
  BIconHouse,
  BIconLock,
  BIconXSquareFill,
  BIconX,
  BIconCheck,
  BIconUnlock,
  BIconCloudArrowUpFill,
} from 'bootstrap-vue'
import Upload from '@/components/Upload'
import Dimensions from '@/components/Dimensions'

export default {
  name: 'TopBar',
  components: {
    Dimensions,
    Upload,
    BIconArchive,
    BIconCloudArrowUpFill,
    BIconXSquareFill,
    BIconX,
    BIconArrowsAngleExpand,
    BIconCamera,
    BIconHouse,
    BIconLock,
    BIconCheck,
    BIconUnlock,
  },
  data() {
    return {
      showSidebar: true,
      showPhotoModal: false,
      showExportModal: false,
      users: [],
      savePending: false,
      saveResult: null,
      exportPending: false,
      exportResult: false,
    }
  },
  computed: {
    locked: {
      get() {
        return this.$store.state.ui.locked
      },
      set(value) {
        this.$store.commit('ui/setLocked', value)
      },
    },
    zoom: {
      get() {
        return this.$store.state.zoom
      },
      set(value) {
        this.$store.commit('setZoom', value)
      },
    },
    showIssueNumbers: {
      get() {
        return this.$store.state.ui.showIssueNumbers
      },
      set(value) {
        this.$store.commit('ui/setShowIssueNumbers', value)
      },
    },
    showPreviousEdge: {
      get() {
        return this.$store.state.ui.showPreviousEdge && this.$store.state.edgesBefore.length
      },
      set(value) {
        this.$store.commit('ui/setShowPreviousEdge', value)
      },
    },
    showNextEdge: {
      get() {
        return this.$store.state.ui.showNextEdge && this.$store.state.edgesAfter.length
      },
      set(value) {
        this.$store.commit('ui/setShowNextEdge', value)
      },
    },
    showEdgePhotos: {
      get() {
        return this.$store.state.ui.showEdgePhotos
      },
      set(value) {
        this.$store.commit('ui/setShowEdgePhotos', value)
      },
    },
    hasPhotoUrl() {
      return Object.values(this.photoUrls).reduce((acc, photoUrls) => acc + photoUrls.length, 0) > 0
    },
    flagImageUrl() {
      return `${process.env.DM_URL}/images/flags/${this.country}.png`
    },
    ...mapState([
      'width',
      'height',
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
      'contributors',
    ]),
    ...mapState('user', ['allUsers']),
  },
  methods: {
    save(runExport) {
      const vm = this
      this.zoom = 1.5
      if (runExport) {
        this.exportPending = true
      } else {
        this.savePending = true
      }
      vm.$nextTick().then(() => {
        vm.issuenumbers.forEach(async (issuenumber) => {
          const response = await vm.$axios.$put('/fs/save', {
            runExport,
            country: vm.country,
            magazine: vm.magazine,
            issuenumber,
            content: document.getElementById(`edge-canvas-${issuenumber}`).outerHTML,
          })
          const isSuccess = response && response.svgPath
          window.setTimeout(() => {
            vm.exportPending = vm.savePending = null
            if (runExport) {
              vm.exportResult = isSuccess ? 'success' : 'error'
            } else {
              vm.saveResult = isSuccess ? 'success' : 'error'
            }
            window.setTimeout(() => {
              vm.exportResult = vm.saveResult = null
            }, 2000)
          }, 1000)
        })
      })
    },
    ...mapMutations(['setDimensions', 'addContributor', 'removeContributor']),
  },
}
</script>
<style scoped>
.spinner-border {
  width: 30px;
  height: 30px;
  margin-bottom: -5px;
}
</style>
