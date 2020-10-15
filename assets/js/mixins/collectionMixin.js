import {mapActions, mapGetters, mapState} from "vuex";

export default {
    computed: {
        ...mapState("coa", ["countryNames", "publicationNames"]),
        ...mapState("collection", ["collection"]),
        ...mapGetters("collection", ["totalPerPublication"])
    },
    methods: {
        ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),
        ...mapActions("collection", ["loadCollection"]),
        findInCollection(publicationCode, issueNumber) {
            return this.collection && this.collection.find(({ country, magazine, issueNumber: collectionIssueNumber }) => publicationCode === `${country}/${magazine}` && collectionIssueNumber === issueNumber )
        }
    },
    async mounted() {
        await this.loadCollection()
    }
}