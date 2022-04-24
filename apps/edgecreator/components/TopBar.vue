<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left position-absolute col-12 col-md-6 options">
        <b-navbar toggleable class="justify-content-start pl-0 pt-0">
          <b-navbar-brand href="#">{{ $t('Options') }}</b-navbar-brand>

          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

          <b-collapse id="nav-collapse" is-nav class="flex-column p-2 bg-white">
            <b-row class="zoom-option">
              <b-col cols="3">
                <input
                  v-model="zoom"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  style="width: 100%"
              /></b-col>
              <b-col>{{ $t('Zoom') }}: {{ zoom }}</b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-checkbox id="showIssueNumbers" v-model="showIssueNumbers" />
              </b-col>
              <b-col
                ><label for="showIssueNumbers">{{
                  $t('Show issue numbers')
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgesBefore.length || showPreviousEdge === null"
                />
              </b-col>
              <b-col
                ><label for="showPreviousEdge">{{
                  $t('Show previous edge')
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgesAfter.length || showNextEdge === null"
                />
              </b-col>
              <b-col
                ><label for="showNextEdge">{{
                  $t('Show next edge')
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-checkbox
                  id="showEdgePhotos"
                  v-model="showEdgePhotos"
                  :disabled="!hasPhotoUrl || showEdgePhotos === null"
                />
              </b-col>
              <b-col
                ><label for="showEdgePhotos">{{
                  $t('Show edge photos')
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-checkbox id="showEdgeOverflow" v-model="showEdgeOverflow" />
              </b-col>
              <b-col
                ><label for="showEdgeOverflow">{{
                  $t('Show edge overflow')
                }}</label></b-col
              >
            </b-row>
          </b-collapse>
        </b-navbar>
      </b-col>
      <b-col align-self="center" class="col-sm-4 offset-4">
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
          hide-condition
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
          <b-icon-info-circle-fill
            id="multiple-issues-hints"
            variant="secondary"
          />
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
            <Gallery
              image-type="photos"
              :items="publicationPhotosForGallery"
              @change="addPhoto"
            />
          </b-modal>
        </b-button>

        <save-model-button />
        <save-model-button v-role="'edit'" with-submit />
        <save-model-button v-role="'admin'" with-export />
      </b-col>
    </b-row>
    <b-row
      align="center"
      class="p-1"
      style="border-bottom: 1px solid lightgray"
    >
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
          <b-collapse
            id="collapse-dimensions"
            v-model="collapseDimensions"
            class="mt-2"
          >
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
              :base-issue-numbers="issuenumbers"
              :disable-ongoing-or-published="false"
              edge-gallery
              disable-not-ongoing-nor-published
              @change="modelToClone = $event"
            />
            <b-btn
              :disabled="!modelToClone"
              @click="$emit('overwrite-model', modelToClone)"
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
import { mapActions, mapState, mapWritableState } from 'pinia'
import {
  BIconArrowsAngleExpand,
  BIconCamera,
  BIconFront,
  BIconHouse,
  BIconInfoCircleFill,
} from 'bootstrap-vue'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import MultipleTargetOptions from './MultipleTargetOptions'
import { ui } from '~/stores/ui'
import { coa } from '~/stores/coa'
import { main } from '~/stores/main'
import Dimensions from '@/components/Dimensions'
import Gallery from '@/components/Gallery'
import IssueSelect from '@/components/IssueSelect'
import SaveModelButton from '@/components/SaveModelButton'
import surroundingEdgeMixin from '@/mixins/surroundingEdgeMixin'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'
import ConfirmEditMultipleValues from '@/components/ConfirmEditMultipleValues'
import SessionInfo from '@/components/SessionInfo'

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
    ...mapWritableState(ui, ['zoom', 'showIssueNumbers', 'showEdgeOverflow']),

    hasPhotoUrl() {
      return Object.keys(this.photoUrls).length
    },
    publicationName() {
      return (
        this.publicationNames &&
        this.publicationNames[`${this.country}/${this.magazine}`]
      )
    },
    uniqueDimensions() {
      return [
        ...new Set(
          Object.values(this.dimensions).map((item) => JSON.stringify(item))
        ),
      ].map((item) => JSON.parse(item))
    },
    isEditingMultiple() {
      return this.isRange || this.issuenumbers.length > 1
    },
    ...mapState(main, [
      'country',
      'magazine',
      'issuenumbers',
      'isRange',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
      'publicationPhotosForGallery',
    ]),
    ...mapState(coa, ['publicationNames']),
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
    ...mapActions(main, ['setPhotoUrl']),
    ...mapActions(coa, ['fetchPublicationNames']),
  },
}
</script>
<style lang="scss">
.options {
  left: 0;
  .navbar-collapse {
    z-index: 1;
    font-size: small;
    opacity: 0.9;

    .row {
      :not(.zoom-option) {
        height: 25px;
      }

      > :nth-child(1) {
        text-align: center;
      }
    }
  }
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
