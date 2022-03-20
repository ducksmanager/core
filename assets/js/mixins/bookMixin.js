import { mapActions } from "pinia/dist/pinia.esm-browser";
import { coa } from "../stores/coa";

export default {

  data: () => ({
    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/f_auto/inducks-covers/',

    edgeWidth: null,
    coverHeight: null,
    coverRatio: null,
  }),

  computed: {
    coverWidth() {
      return this.coverRatio && this.coverHeight / this.coverRatio
    },
  },

  watch: {
    coverWidth(newValue) {
      const availableWidthPerPage = document.body.clientWidth / 2 - 15
      if (newValue > availableWidthPerPage) {
        this.edgeWidth /= newValue / availableWidthPerPage
        this.coverHeight /= newValue / availableWidthPerPage
      }
    },
  },

  methods: {
    ...mapActions(coa, ["fetchIssueUrls"]),

    async loadBookPages(publicationCode, issueNumber) {
      await this.fetchIssueUrls({
        publicationCode: publicationCode,
        issueNumber: issueNumber
      });
    },
  }
}