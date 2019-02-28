import Vue from "vue"
import Router from "vue-router"
import login from '../components/login.vue'
import signup from '../components/signup.vue'
import welcome from '../components/welcome.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: welcome
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/signup',
      component: signup
    }
  ],
  mode: 'history'
})
