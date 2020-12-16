<template>
  <div v-if="progress" class="progress-wrapper">
    <b-progress v-b-tooltip.hover animated :value="progress" :max="100" :variant="variant" />
  </div>
  <b-button
    v-else-if="result === 'success'"
    disabled
    pill
    :variant="`outline-${variant}`"
    size="sm"
  >
    <b-icon-check />
  </b-button>
  <b-button v-else-if="result === 'error'" disabled pill variant="outline-danger" size="sm">
    <b-icon-x />
  </b-button>
  <b-button
    v-else
    v-b-tooltip.hover
    :title="label"
    pill
    :variant="`outline-${variant}`"
    size="sm"
    @click="onClick"
  >
    <b-icon-archive v-if="!isExport" />
    <template v-else>
      <b-icon-cloud-arrow-up-fill />
      <b-modal
        v-model="showExportModal"
        :title="$t('Edge publication')"
        ok-only
        ok-title="Export"
        @ok="run"
      >
        <div v-for="contributionType in ['photographers', 'designers']" :key="contributionType">
          <h2>{{ $t(ucFirst(contributionType)) }}</h2>
          <vue-bootstrap-typeahead
            :ref="`${contributionType}-typeahead`"
            :data="allUsers.filter((user) => !isContributor(user, contributionType))"
            :serializer="({ username }) => username"
            :placeholder="$t('Enter a user name')"
            :min-matching-chars="0"
            @hit="
              addContributorAllIssues($event, contributionType)
              $refs[`${contributionType}-typeahead`][0].inputValue = ''
            "
          />
          <ul>
            <li v-for="user in getContributors(contributionType)" :key="user.username">
              {{ user.username }}
              <b-icon-x-square-fill
                style="cursor: pointer"
                @click="
                  removeContributor({
                    contributionType,
                    userToRemove: user,
                  })
                "
              />
            </li>
          </ul>
        </div>
      </b-modal>
    </template>
  </b-button>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import {
  BIconArchive,
  BIconCheck,
  BIconCloudArrowUpFill,
  BIconX,
  BIconXSquareFill,
} from 'bootstrap-vue'
import saveEdgeMixin from '@/mixins/saveEdgeMixin'

export default {
  components: {
    BIconArchive,
    BIconCheck,
    BIconCloudArrowUpFill,
    BIconXSquareFill,
    BIconX,
  },
  mixins: [saveEdgeMixin],
  props: {
    withExport: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showExportModal: false,
    progress: 0,
    result: null,
  }),
  computed: {
    label() {
      return this.withExport ? 'Export' : 'Save'
    },
    variant() {
      return this.withExport ? 'success' : 'primary'
    },
    isExport() {
      return this.withExport
    },
    ...mapState(['contributors', 'country', 'magazine', 'issuenumbers']),
    ...mapState('user', ['allUsers']),
  },
  watch: {
    progress(newValue) {
      const vm = this
      if (parseInt(newValue) === 100) {
        window.setTimeout(() => {
          vm.progress = 0
          vm.result = 'success'
          window.setTimeout(() => {
            vm.result = null
          }, 2000)
        }, 1000)
      }
    },
  },
  methods: {
    ucFirst: (text) => text[0].toUpperCase() + text.substring(1, text.length),
    getContributors(contributionType) {
      const vm = this
      return this.allUsers.filter((user) => vm.isContributor(user, contributionType))
    },
    isContributor(user, contributionType) {
      const vm = this
      return Object.keys(this.contributors).reduce(
        (acc, issueNumber) =>
          acc ||
          vm.contributors[issueNumber][contributionType]
            .map(({ username }) => username)
            .includes(user.username),
        false
      )
    },
    addContributorAllIssues(user, contributionType) {
      const vm = this
      this.issuenumbers.forEach((issuenumber) => {
        vm.addContributor({ issuenumber, contributionType, user })
      })
    },
    onClick() {
      if (this.withExport) {
        this.showExportModal = !this.showExportModal
      } else {
        this.run()
      }
    },
    run() {
      const vm = this
      this.setZoom(1.5)
      this.$nextTick().then(() => {
        vm.issuenumbers.forEach(async (issuenumber) => {
          vm.saveEdgeSvg(
            vm.country,
            vm.magazine,
            issuenumber,
            vm.contributors[issuenumber],
            vm.withExport
          ).then((response) => {
            const isSuccess = response && response.svgPath
            if (isSuccess) {
              vm.progress = vm.progress + 100 / vm.issuenumbers.length
            } else {
              vm.progress = 0
              vm.result = 'error'
            }
          })
        })
      })
    },
    ...mapMutations('ui', ['setZoom']),
    ...mapMutations(['addContributor', 'removeContributor']),
  },
}
</script>
<style>
.progress-wrapper {
  display: inline-block;
  margin-top: 7px;
  width: 2rem;
}
</style>
