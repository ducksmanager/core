import {mapActions, mapGetters, mapState} from "vuex";

export default {
    computed: {
        ...mapState("collection", ["collection", "purchases"]),
        ...mapGetters("collection", ["totalPerPublication"])
    },
    methods: {
        ...mapActions("collection", ["loadCollection"]),
        findInCollection(publicationCode, issueNumber) {
            return this.collection && this.collection.find(({ country, magazine, issueNumber: collectionIssueNumber }) => publicationCode === `${country}/${magazine}` && collectionIssueNumber === issueNumber )
        }
    },
    async mounted() {
        await this.loadCollection()
    }
}