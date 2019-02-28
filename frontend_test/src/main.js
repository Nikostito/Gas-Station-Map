import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App.vue'
import router from './router'

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
