import '../css/app.css';
import Vue from "vue";
import App from "./layouts/App"

new Vue({
    render(createElement) {
        const vm = this
        let props = {}, component = null
        Object.keys(this.$el.attributes).forEach(key => {
            const { name, value } = vm.$el.attributes[key]
            if (name === 'component') {
                component = value
            }
            else {
                props[name] = value
            }
        })
        return createElement(App, {
            attrs: {
                props,
                component
            }
        })
    }
}).$mount('#app')