<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left">
        <b-button v-b-toggle.sidebar>{{ $t('Options') }}</b-button>
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
          :title="$t('Edge photo')"
          pill
          variant="outline-primary"
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
          :title="$t('Change dimensions')"
          pill
          size="sm"
          variant="outline-primary"
        >
          <b-icon-arrows-angle-expand /> </b-button
        >&nbsp;<b-button
          v-b-tooltip.hover
          :title="$t('Clone from another model')"
          pill
          size="sm"
          variant="outline-primary"
          @click="showCloneModal = !showCloneModal"
        >
          <b-icon-front />
          <b-modal
            v-model="showCloneModal"
            :title="$t('Clone from another model')"
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
        <save-button v-role="'admin'" with-export />
      </b-col>
    </b-row>
    <b-row align="center" class="pb-2" style="border-bottom: 1px solid grey">
      <b-col v-if="publicationName" align-self="center">
        <Issue
          :publicationcode="`${country}/${magazine}`"
          :publicationname="publicationName"
          :issuenumber="issuenumbers[0]"
        >
          <template v-if="issuenumbers.length > 1" #title-suffix
            >to {{ issuenumbers[issuenumbers.length - 1] }}</template
          >
        </Issue>
      </b-col>
    </b-row>
    <div class="language-list m-2">
      <template v-for="({ code, name }, idx) in $i18n.locales"
        ><template v-if="idx > 0"> | </template>
        <span v-if="$i18n.locale === code" :key="code">{{ name }}</span
        ><nuxt-link v-else :key="code" :to="switchLocalePath(code)">{{ name }}</nuxt-link>
      </template>
    </div>
    <div v-if="positionInCanvas" class="cursor-position position-fixed p-2">
      <div>{{ `X = ${positionInCanvas[0]} mm` }}</div>
      <div>{{ `Y = ${positionInCanvas[1]} mm` }}</div>
    </div>
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import {
  BIconArrowsAngleExpand,
  BIconCamera,
  BIconFront,
  BIconHouse,
  BIconLock,
  BIconUnlock,
} from 'bootstrap-vue'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import Dimensions from '@/components/Dimensions'
import Gallery from '@/components/Gallery'
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
    BIconFront,
    BIconHouse,
    BIconLock,
    BIconUnlock,
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
    ...mapState('ui', ['positionInCanvas']),
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
    ...mapState('coa', ['publicationNames']),
  },
  async mounted() {
    await this.fetchPublicationNames([`${this.country}/${this.magazine}`])
  },
  methods: {
    async clone() {
      const { publicationCode, issueNumber } = this.modelToClone
      for (const targetIssuenumber of this.issuenumbers) {
        this.$emit('overwrite-model', { publicationCode, issueNumber, targetIssuenumber })
      }
    },
    ...mapMutations(['setDimensions', 'setPhotoUrl']),
    ...mapActions('coa', ['fetchPublicationNames']),
  },
}
</script>
<style>
.language-list {
  position: absolute;
  right: 0;
  top: 0;
}
.b-icon {
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
