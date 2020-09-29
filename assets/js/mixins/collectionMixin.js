import axios from "axios";
import l10nMixin from "./l10nMixin";

export default {
    mixins: [l10nMixin],
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
        const vm = this
        this.collection = (await axios.get("/collection")).data
        this.countryNames = (await axios.get(`/api/coa/coa/list/countries/${window.locale}`)).data

        const userPublications = [...new Set(this.collection.map(issue => `${issue.country}/${issue.magazine}`))]
        const chunkSize = 10
        const publicationNamesRequests = (await Promise.all(
                await Array.from({length: Math.ceil(userPublications.length / chunkSize)}, (v, i) =>
                    userPublications.slice(i * chunkSize, i * chunkSize + chunkSize)
                ).reduce(async (acc, codeChunk) =>
                        (await acc).concat(await axios.get(`/api/coa/coa/list/publications/${codeChunk.join(',')}`)),
                    Promise.resolve([])
                )
            )
        )
        const publicationNames = publicationNamesRequests.reduce((acc, result) => ({...acc, ...result.data}), {})
        vm.publicationNames = {}
        Object.keys(publicationNames).sort().forEach(function(key) {
            vm.$set(vm.publicationNames, key, publicationNames[key]);
        });
    }
}