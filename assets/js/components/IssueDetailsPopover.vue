<template>
  <b-popover
    :target="`issue-details-${issueNumber}`"
    placement="right"
    triggers="manual"
    show
    @show="loadIssueUrls"
  >
    <template #title>
      <Issue
        :publicationcode="publicationCode"
        :issuenumber="issueNumber"
        :publicationname="publicationNames[publicationCode]"
        hide-condition
      />
    </template>
    <div
      v-if="isCoverLoading"
      class="flex-grow-1"
    >
      {{ $t('Chargement...') }}
    </div>
    <img
      v-else-if="coverUrl"
      :alt="issueNumber"
      :src="coverUrl"
      class="cover"
    >
    <span v-else>{{ $t("La couverture de ce numéro n'est pas disponible") }}</span>
  </b-popover>
</template>

<script>
import Issue from "./Issue";
import {mapActions, mapState} from "pinia";
import l10nMixin from "../mixins/l10nMixin";
import {BPopover} from "bootstrap-vue";
import { coa } from "../stores/coa";

export default {
  name: "IssueDetailsPopover",
  components: {
    BPopover,
    Issue
  },
  mixins: [l10nMixin],
  props: {
    publicationCode: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    }
  },
  emits: ['cover-loaded'],

  data: () => ({
    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/',
    isCoverLoading: true
  }),

  computed: {
    ...mapState(coa, ["publicationNames", "issueDetails"]),

    id() {
      return `issue-details-${this.publicationCode.replace('/', '-')}-${this.issueNumber}`
    },

    issueCode() {
      return `${this.publicationCode} ${this.issueNumber}`
    },

    coverUrl() {
      const cover = this.issueDetails && this.issueDetails[this.issueCode].entries.find(({position}) => !/^p/.test(position))
      const hasCover = cover && !!cover.url
      this.$emit('cover-loaded', hasCover)
      return hasCover ? this.cloudinaryBaseUrl + cover.url : null
    }
  },

  methods: {
    ...mapActions(coa, ["fetchIssueUrls"]),

    async loadIssueUrls() {
      this.isCoverLoading = true
      await this.fetchIssueUrls({
        publicationCode: this.publicationCode,
        issueNumber: this.issueNumber
      });
      this.isCoverLoading = false
    }
  }
}
</script>

<style scoped lang="scss">
.popover  {
  width: 150px;

  ::v-deep .popover-body {
    padding: 0;

    .cover {
      width: 100%;
    }
  }
}
label {
  font-weight: bold;
}
</style>
