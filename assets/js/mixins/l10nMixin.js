import { mapState } from "pinia";
import { l10n } from "../stores/l10n";

const PATH_REGEX = /{([^:]+)(?::([^}]+))?}/g

const matchAll = (haystack, regex) => {
    const matches = [];

    const match_result = haystack.match(regex);
    for (let index in match_result){
        if (match_result.hasOwnProperty(index)) {
            matches[index] = match_result[index].match(new RegExp(regex.source));
        }
    }
    return matches;
}

export default {
    computed: mapState(l10n, ['l10nRoutes']),

    methods: {
        $r(route) {
            const routes = this.l10nRoutes
            if (!routes) {
                return route;
            }
            const routeName = routes[route.replace(PATH_REGEX, '{$1}')]
            const routeL10n = routes[routeName]
            if (!routeL10n) {
                return route
            }
            let finalRoute = routeL10n[localStorage.getItem('locale')];
            [...(matchAll(route, PATH_REGEX))].forEach(([_, key, value]) => {
                finalRoute = finalRoute.replace(`{${key}}`, value)
            })

            // Remove all remaining (default) parameters
            finalRoute = finalRoute.replace(PATH_REGEX, '').replace(/\/$/, '')
            return finalRoute
        },

        ucFirst: string => string[0].toUpperCase() + string.substr(1)
    }
}
