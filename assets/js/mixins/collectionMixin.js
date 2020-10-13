import {mapActions, mapGetters, mapState} from "vuex";

export default {
    computed: {
        ...mapState("coa", ["countryNames", "publicationNames"]),
        ...mapGetters("collection", ["totalPerPublication"])
    },
    methods: {
        ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),
        ...mapActions("collection", ["loadCollection"])
    },
    async mounted() {
        await this.loadCollection()
    }
}