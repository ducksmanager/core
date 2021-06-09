import {mapActions, mapState} from "vuex";

export default {
    computed: {
        ...mapState("collection", ["subscriptions"]),
    },
    methods: {
        ...mapActions("collection", ["loadSubscriptions"])
    },
    async mounted() {
        if (this.username) {
            await this.loadSubscriptions()
        }
    }
}
