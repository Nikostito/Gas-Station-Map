import Vue from "vue"
import router from "vue-router"
import login from '../components/login.vue'
import signup from '../components/signup.vue'
import welcome from '../components/welcome.vue'

Vue.use(router)

export default new router({
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
  mounted(){
    axios.post("http://localhost:8765/observatory/api/authorized", null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
      .then(res => {
        this.showLogin = false;
      })
      .catch((errors) => {
        this.showLogin = true;
      })
  },
  mode: 'history'
})
