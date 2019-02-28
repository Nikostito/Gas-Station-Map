import router from '../router'
<template>
<div id="login">
<form v-on:submit="login">
  <fieldset>
    <div class="form-group">
      <label for="Username">Username</label>
      <input type="text" class="form-control" name="username" placeholder="Enter username">
    </div>
    <div class="form-group">
      <label for="Password">Password</label>
      <input type="password" class="form-control" name="password" placeholder="Enter Password">
    </div>
    </fieldset>
    <input type="submit" value="Login"/>
</form>
</div>
</template>
<script>
import axios from "axios"
export default {
  name: "Login",
  methods: {
    login: (e) => {
      e.preventDefault()
      let username = e.target.elements.username.value
      let password = e.target.elements.password.value

      let login = () => {
        let data = {
          username: username,
          password: password
        }

        axios.post("http://localhost:8765/observatory/api/login", data)
          .then((response) => {
            console.log("Logged in")
            Router.push("/")
          })
          .catch((errors) => {
            console.log("Cannot log in.Wrong Username or Password")
          })
      }
      login()
    }
  }
}
</script>

<style lang="scss">
@import '../../css/variables.scss';
</style>
<style>
@import '../../css/bootstrap.css';
</style>
