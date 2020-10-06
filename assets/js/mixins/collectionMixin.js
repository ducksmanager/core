import axios from "axios";
import l10nMixin from "./l10nMixin";
import {mapActions, mapState} from "vuex";

export default {
    mixins: [l10nMixin],
    data() {
        return {
            username: window.username,
            collection: null
        }
    },
    computed: {
        ...mapState("coa", ["countryNames", "publicationNames"]),
        totalPerPublication() {
            return this.collection && this.collection.reduce((acc, issue) => {
                const publicationCode = `${issue.country}/${issue.magazine}`
                return ({...acc, [publicationCode]: (acc[publicationCode] || 0) + 1});
            }, {})
        },
    },
    methods: {
        ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"])
    },
    async mounted() {
        this.collection = (await axios.get("/collection")).data
        this.fetchCountryNames()
        await this.fetchPublicationNames(
            [...new Set(this.collection.map(issue => `${issue.country}/${issue.magazine}`))]
        )
    }
}