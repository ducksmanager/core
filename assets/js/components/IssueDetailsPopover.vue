<template>
  <span v-if="l10n">
    <span :id="id">
      &nbsp;<slot />
    </span>
    <b-popover
      :target="id"
      placement="right"
      triggers="hover"
      :delay="0"
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
      >{{ l10n.CHARGEMENT }}</div>
      <img
        v-else-if="coverUrl"
        :alt="issueNumber"
        :src="coverUrl"
        class="cover"
      >
      <span v-else>{{ l10n.AUCUNE_COUVERTURE }}</span>
    </b-popover>
  </span>
</template>

<script>
import Issue from "./Issue";
import {mapActions, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "IssueDetailsPopover",
  components: {
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

  data: () => ({
    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/',
    isCoverLoading: true
  }),

  computed: {
    ...mapState("coa", ["publicationNames", "issueDetails"]),

    id() {
      return `issue-details-${this.publicationCode.replace('/', '-')}-${this.issueNumber}`
    },

    issueCode() {
      return `${this.publicationCode} ${this.issueNumber}`
    },

    coverUrl() {
      const cover = this.issueDetails && this.issueDetails[this.issueCode].find(({position}) => !/^p/.test(position))
      return cover ? this.cloudinaryBaseUrl + cover.url : null
    }
  },

  methods: {
    ...mapActions("coa", ["fetchIssueUrls"]),

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