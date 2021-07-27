<template>
  <b-button
    v-if="progress || result === 'success'"
    disabled
    pill
    :variant="`outline-${variant}`"
    size="sm"
  >
    <b-progress
      v-if="progress"
      v-b-tooltip.hover
      animated
      :value="progress"
      :max="100"
      :variant="variant"
    />
    <b-icon-check v-if="result === 'success'" />
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
    <b-icon-archive v-if="!withExport && !withSubmit" />
    <template v-else>
      <b-icon-cloud-arrow-up-fill />
      <b-modal
        v-model="showModal"
        :title="$t(withExport ? 'Edge publication' : 'Edge validation')"
        ok-only
        :ok-disabled="!hasAtLeastOneUser('photographers') || !hasAtLeastOneUser('designers')"
        :ok-title="$t(withExport ? 'Export' : 'Submit')"
        @ok="issueIndexToSave = 0"
      >
        <b-alert show variant="info">{{
          $t(
            'Once your edge is ready, indicate the photographers and the designers of the edge. ' +
              'When you click "Submit", the edge will be sent to an administrator for validation ' +
              'before it is published on DucksManager'
          )
        }}</b-alert>
        <div v-for="contributionType in ['photographers', 'designers']" :key="contributionType">
          <h2>{{ $t(ucFirst(contributionType)) }}</h2>
          <b-alert v-if="!hasAtLeastOneUser(contributionType)" show variant="warning">{{
            $t('You should select at least one user')
          }}</b-alert>
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
                v-if="!(user.username === username && contributionType === 'designers')"
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
    withSubmit: {
      type: Boolean,
      default: false,
    },
    withExport: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showModal: false,
    progress: 0,
    issueIndexToSave: null,
    result: null,
  }),
  computed: {
    label() {
      return this.$t(this.withExport ? 'Export' : this.withSubmit ? 'Submit' : 'Save')
    },
    variant() {
      return this.withExport || this.withSubmit ? 'success' : 'primary'
    },
    ...mapState(['contributors', 'country', 'magazine', 'issuenumbers']),
    ...mapState('user', ['allUsers', 'username']),
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
    issueIndexToSave(newValue) {
      const vm = this
      const currentIssueNumber = vm.issuenumbers[newValue]

      if (currentIssueNumber === undefined) {
        return
      }

      this.setZoom(1.5)
      this.$nextTick(() => {
        vm.saveEdgeSvg(
          vm.country,
          vm.magazine,
          currentIssueNumber,
          vm.contributors[currentIssueNumber],
          vm.withExport,
          vm.withSubmit
        ).then((response) => {
          const isSuccess = response.paths && response.paths.svgPath
          if (isSuccess) {
            vm.progress += 100 / vm.issuenumbers.length
            vm.issueIndexToSave += 1
          } else {
            vm.progress = 0
            vm.result = 'error'
            vm.issueIndexToSave = null
          }
        })
      })
    },
    showModal(newValue) {
      if (newValue && this.withSubmit) {
        this.addContributorAllIssues(
          this.allUsers.find((user) => user.username === this.username),
          'designers'
        )
      }
    },
  },

  mounted() {
    this.setUsername(this.$cookies.get('dm-user'))
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
    hasAtLeastOneUser(contributionType) {
      return Object.values(this.contributors).every(
        (contributionsForIssue) => contributionsForIssue[contributionType].length
      )
    },
    onClick() {
      if (this.withExport || this.withSubmit) {
        this.showModal = !this.showModal
      } else {
        this.issueIndexToSave = 0
      }
    },
    ...mapMutations('ui', ['setZoom']),
    ...mapMutations('user', ['setUsername']),
    ...mapMutations(['addContributor', 'removeContributor']),
  },
}
</script>
<style scoped lang="scss">
::v-deep.btn {
  width: 2.25rem;
  height: 2rem;
}

.bi-x-square-fill {
  cursor: pointer;
}
</style>
