import axios from "axios";
import l10nMixin from "./l10nMixin";
import coaMixin from "./coaMixin";

export default {
    mixins: [coaMixin, l10nMixin],
    data() {
        return {
            username: window.username,
            collection: null,
            countryNames: null,
            publicationNames: null
        }
    },
    computed: {
        totalPerPublication() {
            return this.collection ? this.collection.reduce((acc, issue) => {
                const publicationCode = `${issue.country}/${issue.magazine}`
                return ({...acc, [publicationCode]: (acc[publicationCode] || 0) + 1});
            }, {}) : {}
        },
    },
    async mounted() {
        this.collection = (await axios.get("/collection")).data
        this.countryNames = await this.getCountryNames()
        this.publicationNames = await this.getPublicationNames(
            [...new Set(this.collection.map(issue => `${issue.country}/${issue.magazine}`))]
        )
    }
}