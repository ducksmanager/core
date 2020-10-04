import axios from "axios";
import {safeLoad} from "js-yaml";

export default {
    data() {
        return {
            l10n: null,
            locale: null
        }
    },
    async mounted() {
        this.locale = window.locale
        this.l10n = safeLoad((await axios.get(window.l10nUrl)).data)
    },

    methods: {
        $t(key, parameters = []) {
            let match
            let parameterIndex = 0
            let translation = this.l10n[key]
            while (true) {
                if ((match = /%\w/.exec(translation)) != null) {
                    const replacement = parameters[parameterIndex] || '';
                    translation = translation.substring(0, match.index) + replacement + translation.substring(match.index + match[0].length);
                }
                break;
            }
            return translation
        }
    }
}