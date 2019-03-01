<template>
<div id="signup">
<form v-on:submit="signup">
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
    <button type="submit" class="btn btn-secondary" value="signup">Sign Up</button>
</form>
</div>
</template>
<style lang="scss">
@import '../../css/variables.scss';
</style>
<style>
@import '../../css/bootstrap.css';
</style>
<script>
import router from "../router/index.js"
import axios from "axios"
export default {
  name: "signup",
  methods: {
    signup: (e) => {
      e.preventDefault()
      let username = e.target.elements.username.value
      let password = e.target.elements.password.value

      let signup = () => {
        let data = {
          username: username,
          password: password
        }

        axios.post("http://localhost:8765/observatory/api/signup", data)
          .then((response) => {
            alert("Έχετε εγγραφεί με επιτυχία! Προχωρήστε στο Login.")            
            router.push("/login")
          })
          .catch((errors) => {
            console.log("Cannot signup.Error occured")
          })
      }
      signup()
    }
  }
}
</script>
