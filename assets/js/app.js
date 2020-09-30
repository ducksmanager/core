import '../css/app.css';
import Vue from "vue";
import Print from "./components/Print"

new Vue({
    render(createElement) {
        const vm = this
        let vueProps = {}
        Object.keys(this.$el.attributes).forEach(key => {
            const { name, value } = vm.$el.attributes[key]
            vueProps[name] = value
        })
        return createElement(Print, {
            props: vueProps
        })
    },
    created() {
    }
}).$mount('#app')