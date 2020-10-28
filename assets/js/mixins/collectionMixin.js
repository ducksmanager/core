import {mapActions, mapGetters, mapState} from "vuex";
import userMixin from "./userMixin";

export default {

    mixins: [userMixin],

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
        if (this.username) {
            await this.loadCollection()
        }
    }
}