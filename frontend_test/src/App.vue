<template>
    <div>
        <app-header></app-header>
        <router-view></router-view>
    </div>
</template>
<script>
import home from './components/home.vue';
import router from './router/index.js'
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
