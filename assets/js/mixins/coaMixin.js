import axios from "axios";

export default {
    methods: {
        async getCountryNames() {
            return (await axios.get(`/api/coa/coa/list/countries/${window.locale}`)).data
        },
        async getPublicationNames(publicationCodes) {
            let vm = this;
            const chunkSize = 10
            const publicationNamesRequests = await this.getChunkedRequests('/api/coa/coa/list/publications/', publicationCodes, chunkSize)
            const publicationNames = publicationNamesRequests.reduce((acc, result) => ({...acc, ...result.data}), {})
            const sortedPublicationNames = {}
            Object.keys(publicationNames).sort().forEach(function(key) {
                vm.$set(sortedPublicationNames, key, publicationNames[key]);
            });

            return sortedPublicationNames
        },
        async getIssueNumbers(publicationCodes) {
            const chunkSize = 1
            const urlPrefix = '/api/coa/coa/list/issues/'
            const issueNumbersRequests = await this.getChunkedRequests(urlPrefix, publicationCodes, chunkSize)
            return issueNumbersRequests.reduce((acc, result) => ({
                ...acc,
                [result.config.url.replace(urlPrefix, '')]: result.data.map(issueNumber => issueNumber.replace(/ /g, ''))
            }), {})
        },
        getChunkedRequests: async function (url, parametersToChunk, chunkSize) {
            return await Promise.all(
                await Array.from({length: Math.ceil(parametersToChunk.length / chunkSize)}, (v, i) =>
                    parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
                ).reduce(async (acc, codeChunk) =>
                        (await acc).concat(await axios.get(`${url}${codeChunk.join(',')}`)),
                    Promise.resolve([])
                )
            );
        },
    }
}