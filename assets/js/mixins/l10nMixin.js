import {mapActions, mapState} from "vuex";

const PATH_REGEX = /{([^:]+)(?::([^}]+))?}/g
export default {
    computed: mapState("l10n", ["l10n", "l10nRoutes"]),

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
                    let replacement = parameters[parameterIndex++];
                    if (replacement === undefined) {
                        replacement = ''
                    }
                    translation = translation.substring(0, match.index) + replacement + translation.substring(match.index + match[0].length);
                } else break;
            }
            return translation
        },

        $r(route) {
            const routes = this.l10nRoutes
            const routeName = routes[route.replaceAll(PATH_REGEX, '{$1}')]
            const routeL10n = routes[routeName]
            if (!routeL10n) {
                return route
            }
            let finalRoute = routeL10n[window.locale];
            if (route === '/bookcase/show') {
                console.log(finalRoute)
                debugger
            }
            [...(route.matchAll(PATH_REGEX))].forEach(([_, key, value]) => {
                finalRoute = finalRoute.replace(`{${key}}`, value)
            })

            // Remove all remaining (default) parameters
            finalRoute = finalRoute.replaceAll(PATH_REGEX, '').replace(/\/$/, '')
            return finalRoute
        },

        ucFirst: string => string[0].toUpperCase() + string.substr(1)
    }
}