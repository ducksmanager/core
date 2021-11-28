import {mapActions, mapState} from "pinia";
import { collection } from "../stores/collection";

export default {

    computed: {
        ...mapState(collection, ["collection", "purchases", "totalPerPublication"])
    },
    methods: {
        ...mapActions(collection, ["loadCollection"]),
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
