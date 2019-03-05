<template>
  <div id="app">
    <meta name="mobile-web-app-capable" content="yes">
    <Login/>
    <GoogleMap/>
  </div>
</template>

<script>
// console.log(localStorage);
import Login from './components/Login.vue'
import GoogleMap from './components/Map.vue'

export default {
  name: 'app',
  components: {
    Login,
    GoogleMap
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
