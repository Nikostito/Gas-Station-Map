<template>
    <div>
        <app-header></app-header>
        <router-view></router-view>
    </div>
</template>
<script>
// Imports
import home from './components/home.vue';
import welcome from './components/welcome.vue';
import signup from './components/signup.vue';
import login from "./components/login.vue"
import router from './router'



export default {
    components: {
        'app-header': home
    },
    data () {
        return {

        }
    },
    methods: {

    }
}
</script>
