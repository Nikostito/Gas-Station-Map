<template>
<div id="login">
  <div v-show="showLogin">
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
        <button type="submit" class="btn btn-secondary" value="login">Login</button>
        <h1>{{textResponse}}</h1>
    </form>
  </div>
  <div v-show="!showLogin">
    <form v-on:submit="logout">
      <center><h2>Είστε ήδη συνδεδεμένος, πατήστε το κουμπί <b>Αποσύνδεση</b>, για να αποσυνδεθείτε από την πλατφόρμα</h2></center>
      <center><input type="submit" value="Αποσύνδεση"/></center>
    </form>
  </div>
</div>
</template>

<script>
import axios from "axios"
import router from "../router/index.js"
export default {
  name: "Register-Login-out",
  data(){
    return {
      showLogin:true,
      textResponse:''
    }
  },
  methods: {
    login(e){
      let slf = this;
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
            localStorage.setItem('token',response.data.token);
            slf.showLogin = false;
            console.log(localStorage.token);
            alert("Έχετε συνδεθεί!")
            router.push("/");
            router.go("/");
          })
          .catch((errors) => {
            slf.textResponse = "Λάθος όνομα χρήστη/συνθηματικού";
          })
      }
      login()
    },
    logout(e){
    e.preventDefault()
    let logout = () => {
      axios.post("http://localhost:8765/observatory/api/logout", null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
        .then((response) => {
          this.showLogin = true;
          alert("Έχετε αποσυνδεθεί!")
          router.push("/");
          router.go("/");
        })
        .catch((errors) => {
          console.log("Already logged out"); // should only ever go here if token expired
        })
    }
    logout()
  }
},
  mounted(){
    axios.post("http://localhost:8765/observatory/api/authorized", null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
      .then(res => {
        this.showLogin = false;
      })
      .catch((errors) => {
        this.showLogin = true;
      })
  }
}


</script>

<style lang="scss">
@import '../../css/variables.scss';
</style>
<style>
@import '../../css/bootstrap.css';
</style>
