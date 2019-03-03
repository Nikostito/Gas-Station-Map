import Vue from 'vue'
// import VueCookie from 'VueCookie'
import App from './App.vue'
import * as VueGoogleMaps from "vue2-google-maps";


//Vue.use(VueCookie);
Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyBFtJWeUHB9p4LlMCjvnojvvxEmeRWI8h4",
    libraries: "places" // necessary for places input
  }
});
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
