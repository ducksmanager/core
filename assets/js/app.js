import '../css/app.css';
import Vue from "vue";
import Print from "./components/Print"

new Vue({
    data() {
        return {
            printType: null
        }
    },
    render(createElement) {
        return createElement(Print, {
            props: {
                printType: this.printType
            }
        })
    },
    beforeMount() {
        this.printType = this.$el.attributes['data-print-style'].value;
    }
}).$mount('#app-print')