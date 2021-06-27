<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left">
        <b-button v-b-toggle.sidebar class="options position-fixed mt-2"
          >{{ $t('Options') }}
        </b-button>
        <b-sidebar id="sidebar" v-model="showSidebar" :title="$t('Options')" shadow>
          <b-container class="px-3 py-2">
            <b-row align-items="center">
              <b-col cols="6"> {{ $t('Zoom') }}</b-col>
              <b-col cols="2">{{ zoom }}</b-col>
              <b-col cols="4">
                <input v-model="zoom" type="range" min="1" max="8" step="0.5" style="width: 100%"
              /></b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showIssueNumbers">{{ $t('Show issue numbers') }}</label></b-col
              >
              <b-col>
                <b-checkbox id="showIssueNumbers" v-model="showIssueNumbers" />
              </b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showPreviousEdge">{{ $t('Show previous edge') }}</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgesBefore.length || showPreviousEdge === null"
                />
              </b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showNextEdge">{{ $t('Show next edge') }}</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgesAfter.length || showNextEdge === null"
                />
              </b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showEdgePhotos">{{ $t('Show edge photos') }}</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showEdgePhotos"
                  v-model="showEdgePhotos"
                  :disabled="!hasPhotoUrl || showEdgePhotos === null"
                />
              </b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showEdgeOverflow">{{ $t('Show edge overflow') }}</label></b-col
              >
              <b-col>
                <b-checkbox id="showEdgeOverflow" v-model="showEdgeOverflow" />
              </b-col>
            </b-row>
          </b-container>
        </b-sidebar>
      </b-col>
      <b-col align-self="center" class="col-sm-4">
        <b-button to="/">
          <b-icon-house />
          {{ $t('Home') }}
        </b-button>
      </b-col>
      <b-col />
    </b-row>
    <b-row align="center" class="pb-1">
      <b-col v-if="publicationName" align-self="center">
        <Issue
          :publicationcode="`${country}/${magazine}`"
          :publicationname="publicationName"
          :issuenumber="issuenumbers[0]"
        >
          <template v-if="isEditingMultiple" #title-suffix>
            <template v-if="isRange"
              >{{ $t('to') }} {{ issuenumbers[issuenumbers.length - 1] }}
            </template>
            <template v-else-if="issuenumbers.length > 1"
              ><span
                v-for="otherIssuenumber in issuenumbers.slice(1)"
                :key="`other-${otherIssuenumber}`"
                >, {{ otherIssuenumber }}</span
              ></template
            ></template
          >
        </Issue>

        <template v-if="isEditingMultiple">
          <b-icon-info-circle-fill id="multiple-issues-hints" variant="secondary" />
          <b-popover
            id="multiple-issues-hints-popover"
            target="multiple-issues-hints"
            triggers="hover"
            placement="bottom"
          >
            <template #title>{{ $t('Multiple-edge modification') }}</template>
            <ul class="pl-2">
              <li>
                {{
                  $t(
                    'If you want your changes to be applied to a single edge, click on its issue number.'
                  )
                }}
              </li>
              <li>
                {{
                  $t(
                    'If you want to add an edge to the list of edges to apply changes on, click on its issue number while maintaining the Shift key pressed.'
                  )
                }}
              </li>
              <li>
                {{
                  $t(
                    'If you want to apply your changes to all the edges at the same time, double-click on any issue number.'
                  )
                }}
              </li>
            </ul>
          </b-popover>
        </template>
      </b-col>
    </b-row>
    <b-row align="center" class="p-1">
      <b-col align-self="center">
        <b-button
          v-b-tooltip.hover
          :title="$t('Edge photo')"
          pill
          variant="outline-primary"
          size="sm"
          @click="showPhotoModal = !showPhotoModal"
        >
          <b-icon-camera />
          <b-modal v-model="showPhotoModal" ok-only>
            <Gallery image-type="photos" :items="publicationPhotosForGallery" @change="addPhoto" />
          </b-modal>
        </b-button>

        <save-model-button />
        <save-model-button v-role="'edit'" with-submit />
        <save-model-button v-role="'admin'" with-export />
      </b-col>
    </b-row>
    <b-row align="center" class="p-1" style="border-bottom: 1px solid lightgray">
      <b-col align-self="center">
        <MultipleTargetOptions>
          <b-button
            v-b-tooltip.hover
            :title="$t('Change dimensions')"
            pill
            size="sm"
            variant="outline-primary"
            @click="
              collapseClone = false
              collapseDimensions = !collapseDimensions
            "
          >
            <b-icon-arrows-angle-expand /> </b-button
          >&nbsp;<b-button
            v-b-tooltip.hover
            :title="$t('Clone from another model')"
            pill
            size="sm"
            variant="outline-primary"
            @click="
              collapseDimensions = false
              collapseClone = !collapseClone
            "
          >
            <b-icon-front />
          </b-button>
          <b-collapse id="collapse-dimensions" v-model="collapseDimensions" class="mt-2">
            <confirm-edit-multiple-values :values="uniqueDimensions">
              <dimensions
                :width="uniqueDimensions[0].width"
                :height="uniqueDimensions[0].height"
                @change="$emit('set-dimensions', $event)"
              />
            </confirm-edit-multiple-values>
          </b-collapse>
          <b-collapse id="collapse-clone" v-model="collapseClone" class="mt-2">
            <issue-select
              v-if="collapseClone"
              :country-code="country"
              :publication-code="`${country}/${magazine}`"
              :disable-ongoing-or-published="false"
              edge-gallery
              disable-not-ongoing-nor-published
              @change="modelToClone = $event"
            />
            <b-btn :disabled="!modelToClone" @click="$emit('overwrite-model', modelToClone)"
              >{{ $t('Clone') }}
            </b-btn>
          </b-collapse>
        </MultipleTargetOptions>
      </b-col>
    </b-row>
    <session-info />
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import {
  BIconArrowsAngleExpand,
  BIconCamera,
  BIconFront,
  BIconHouse,
  BIconInfoCircleFill,
} from 'bootstrap-vue'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import Dimensions from '@/components/Dimensions'
import Gallery from '@/components/Gallery'
import IssueSelect from '@/components/IssueSelect'
import SaveModelButton from '@/components/SaveModelButton'
import surroundingEdgeMixin from '@/mixins/surroundingEdgeMixin'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'
import ConfirmEditMultipleValues from '@/components/ConfirmEditMultipleValues'
import SessionInfo from '@/components/SessionInfo'
import MultipleTargetOptions from './MultipleTargetOptions'

export default {
  name: 'TopBar',
  components: {
    SessionInfo,
    ConfirmEditMultipleValues,
    MultipleTargetOptions,
    SaveModelButton,
    Issue,
    IssueSelect,
    Gallery,
    Dimensions,
    BIconArrowsAngleExpand,
    BIconCamera,
    BIconFront,
    BIconHouse,
    BIconInfoCircleFill,
  },
  mixins: [surroundingEdgeMixin, showEdgePhotosMixin],
  props: {
    dimensions: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showSidebar: true,
      showPhotoModal: false,
      showUploadPhotoModal: false,

      showCloneModal: false,
      modelToClone: null,

      collapseDimensions: false,
      collapseClone: false,
    }
  },
  computed: {
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
    showEdgeOverflow: {
      get() {
        return this.$store.state.ui.showEdgeOverflow
      },
      set(value) {
        this.$store.commit('ui/setShowEdgeOverflow', value)
      },
    },

    hasPhotoUrl() {
      return Object.keys(this.photoUrls).length
    },
    publicationName() {
      return this.publicationNames && this.publicationNames[`${this.country}/${this.magazine}`]
    },
    uniqueDimensions() {
      return [...new Set(Object.values(this.dimensions).map((item) => JSON.stringify(item)))].map(
        (item) => JSON.parse(item)
      )
    },
    isEditingMultiple() {
      return this.isRange || this.issuenumbers.length > 1
    },
    ...mapState([
      'country',
      'magazine',
      'issuenumbers',
      'isRange',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
    ]),
    ...mapState('coa', ['publicationNames']),
    ...mapGetters(['publicationPhotosForGallery']),
  },
  async mounted() {
    await this.fetchPublicationNames([`${this.country}/${this.magazine}`])
  },
  methods: {
    addPhoto(src) {
      if (!(this.photoUrls[this.issuenumbers[0]] || []).includes(src)) {
        this.setPhotoUrl({ issuenumber: this.issuenumbers[0], filename: src })
      }
    },
    ...mapMutations(['setPhotoUrl']),
    ...mapActions('coa', ['fetchPublicationNames']),
  },
}
</script>
<style lang="scss">
.btn.options {
  top: 0;
  left: 130px;
}

::v-deep .b-icon {
  vertical-align: sub !important;
  height: 15px;
}

.cursor-position {
  border: 1px solid black;
  z-index: 1;
  right: 0;
  bottom: 0;
}
</style>
