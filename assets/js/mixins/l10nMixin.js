import {mapActions, mapState} from "vuex";

export default {
    computed: mapState("l10n", ["l10n"]),

    async mounted() {
        await this.loadL10n()
    },

    methods: {
        ...mapActions("l10n", ["loadL10n"]),
        $t(key, parameters = []) {
            let match
            let parameterIndex = 0
            let translation = this.l10n[key]
            while (true) {
                if ((match = /%\w/.exec(translation)) != null) {
                    const replacement = parameters[parameterIndex++] || '';
                    translation = translation.substring(0, match.index) + replacement + translation.substring(match.index + match[0].length);
                } else break;
            }
            return translation
        },

        ucFirst: string => string[0].toUpperCase() + string.substr(1)
    }
}