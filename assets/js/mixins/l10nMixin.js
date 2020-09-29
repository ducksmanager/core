import axios from "axios";
import { safeLoad } from "js-yaml";

export default {
    data() {
        return {
            l10n: null
        }
    },
    async mounted() {
        this.l10n = safeLoad((await axios.get(window.l10nUrl)).data)
    }
}