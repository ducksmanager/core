import {mapActions, mapState} from "pinia";
import { collection } from "../stores/collection";

export default {
    computed: {
        ...mapState(collection, ["subscriptions"]),
    },
    methods: {
        ...mapActions(collection, ["loadSubscriptions"])
    },
    async mounted() {
        if (this.username) {
            await this.loadSubscriptions()
        }
    }
}
