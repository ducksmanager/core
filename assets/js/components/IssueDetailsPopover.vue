<template>
  <span v-if="l10n">
    <span :id="id">
      <slot />
    </span>
    <b-popover
      :target="id"
      :placement="placement"
      triggers="hover focus"
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
    },
    placement: {
      type: String,
      required: true
    }
  },

  data: () => ({
    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/',
    isCoverLoading: true
  }),

  computed: {
    ...mapState("coa", ["publicationNames", "issueUrls"]),

    id() {
      return `issue-details-${this.publicationCode}-${this.issueNumber}`
    },

    issueCode() {
      return `${this.publicationCode} ${this.issueNumber}`
    },

    coverUrl() {
      const cover = this.issueUrls && this.issueUrls[this.issueCode].find(({position}) => !/^p/.test(position))
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