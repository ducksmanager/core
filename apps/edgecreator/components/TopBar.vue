<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left">
        <b-button v-b-toggle.sidebar>Toggle Options</b-button>
        <b-sidebar id="sidebar" v-model="showSidebar" title="Options" shadow>
          <b-container class="px-3 py-2">
            <b-row align-items="center">
              <b-col cols="6"> Zoom</b-col>
              <b-col cols="2">{{ zoom }}</b-col>
              <b-col cols="4">
                <input v-model="zoom" type="range" min="1" max="8" step="0.5" style="width: 100%"
              /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showIssueNumbers">Show issue numbers</label></b-col>
              <b-col>
                <b-checkbox id="showIssueNumbers" v-model="showIssueNumbers" />
              </b-col>
            </b-row>
            <b-row>
              <b-col><label for="showPreviousEdge">Show previous edge</label></b-col>
              <b-col>
                <b-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgesBefore.length || showPreviousEdge === null"
                />
              </b-col>
            </b-row>
            <b-row>
              <b-col><label for="showNextEdge">Show next edge</label></b-col>
              <b-col>
                <b-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgesAfter.length || showNextEdge === null"
                />
              </b-col>
            </b-row>
            <b-row>
              <b-col><label for="showEdgePhotos">Show edge photos</label></b-col>
              <b-col>
                <b-checkbox
                  id="showEdgePhotos"
                  v-model="showEdgePhotos"
                  :disabled="!hasPhotoUrl || showEdgePhotos === null"
                />
              </b-col>
            </b-row>
          </b-container>
        </b-sidebar>
      </b-col>
      <b-col align-self="center" class="col-sm-4">
        <b-button to="/">
          <b-icon-house />
          Home
        </b-button>
      </b-col>
      <b-col />
    </b-row>
    <b-row align="center" class="p-2">
      <b-col align-self="center">
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
        >
          <b-icon-lock v-if="locked" />
          <b-icon-unlock v-else />
        </b-button>
        <b-button
          v-b-tooltip.hover
          title="Edge photo"
          pill
          variant="outline-primary"
          :disabled="issuenumbers.length > 1"
          size="sm"
          @click="showPhotoModal = !showPhotoModal"
        >
          <b-icon-camera />
          <b-modal v-model="showPhotoModal" ok-only>
            <Gallery image-type="photos" />
          </b-modal>
        </b-button>
        <b-button
          v-b-tooltip.hover
          v-b-toggle.collapse-dimensions
          title="Change dimensions"
          pill
          size="sm"
          variant="outline-primary"
        >
          <b-icon-arrows-angle-expand /> </b-button
        >&nbsp;<b-button
          v-b-tooltip.hover
          title="Clone from another model"
          pill
          size="sm"
          variant="outline-primary"
          @click="showCloneModal = !showCloneModal"
        >
          <b-icon-custom-duplicate />
          <b-modal
            v-model="showCloneModal"
            title="Clone from another model"
            ok-only
            ok-title="Clone"
            :ok-disabled="!modelToClone"
            @ok="clone()"
          >
            <issue-select
              :country-code="country"
              :publication-code="`${country}/${magazine}`"
              :disable-ongoing-or-published="false"
              disable-not-ongoing-nor-published
              @change="modelToClone = $event"
            />
          </b-modal>
        </b-button>

        <save-button />
        <save-button with-export />
      </b-col>
    </b-row>
    <b-row align="center" class="pb-2" style="border-bottom: 1px solid grey">
      <b-col v-if="publications[country]" align-self="center">
        <Issue
          :publicationcode="`${country}/${magazine}`"
          :publicationname="publications[country][`${country}/${magazine}`]"
          :issuenumber="issuenumbers[0]"
        />
        <span v-if="issuenumbers.length > 1"> to {{ issuenumbers[issuenumbers.length - 1] }}</span>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import {
  BIconArrowsAngleExpand,
  BIconCamera,
  BIconHouse,
  BIconLock,
  BIconUnlock,
} from 'bootstrap-vue'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import Dimensions from '@/components/Dimensions'
import Gallery from '@/components/Gallery'
import BIconCustomDuplicate from '@/components/BIconCustomDuplicate'
import IssueSelect from '@/components/IssueSelect'
import SaveButton from '@/components/SaveModelButton'
import surroundingEdgeMixin from '@/mixins/surroundingEdgeMixin'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'

export default {
  name: 'TopBar',
  components: {
    SaveButton,
    Issue,
    IssueSelect,
    Gallery,
    Dimensions,
    BIconArrowsAngleExpand,
    BIconCamera,
    BIconHouse,
    BIconLock,
    BIconUnlock,
    BIconCustomDuplicate,
  },
  mixins: [surroundingEdgeMixin, showEdgePhotosMixin],
  data() {
    return {
      showSidebar: true,
      showPhotoModal: false,
      showUploadPhotoModal: false,

      showCloneModal: false,
      modelToClone: null,
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
        return this.$store.state.ui.zoom
      },
      set(value) {
        this.$store.commit('ui/setZoom', value)
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
    hasPhotoUrl() {
      return Object.keys(this.photoUrls).length
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
    ]),
    ...mapState('coa', ['publications']),
  },
  async mounted() {
    window.imagePath = '/images/'
    await this.loadPublicationsByCountry(this.country)
  },
  methods: {
    async clone() {
      const { publicationCode, issueNumber } = this.modelToClone
      for (const targetIssuenumber of this.issuenumbers) {
        this.$emit('overwrite-model', { publicationCode, issueNumber, targetIssuenumber })
      }
    },
    ...mapMutations(['setDimensions', 'setPhotoUrl']),
    ...mapActions('coa', ['loadPublicationsByCountry']),
  },
}
</script>
<style>
.b-icon {
  vertical-align: sub !important;
  height: 15px;
}

.b-icon.bi-square,
.b-icon.bi-square-fill {
  vertical-align: middle !important;
}
</style>
