<template>
    <div class="login">
      <div v-show="showLogin">
        <form v-on:submit="login">
            <input type="text" name="username" placeholder="όνομα χρήστη"/><br>
            <input type="password" name="password" placeholder="κωδικός χρήστη"/><br>
            <input type="submit" value="Είσοδος"/><br>
            <input type="submit" value="Εγγραφή"/>
        </form>
        <h1>{{textResponse}}</h1>
      </div>
      <div v-show="!showLogin">
        <form v-on:submit="logout">
            <input type="submit" value="Αποσύνδεση"/>
        </form>
      </div>
    </div>
</template>

<script>
import axios from "axios"
import helper from "./HelperFuncts";
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

      axios.post(helper.BASE_URL + '/login', data)
        .then((response) => {
          localStorage.setItem('token',response.data.token);
          slf.showLogin = false;
          // console.log(localStorage.token);
        })
        .catch((errors) => {
          slf.textResponse = "Λάθος όνομα χρήστη/συνθηματικού";
        })
      }
      let register = () => {
        let data = {
          username: username,
          password: password
        }

        axios.post(helper.BASE_URL + '/signup', data)
          .then((response) => {
            slf.textResponse = 'Επιτυχής εγγραφή';
            // console.log(localStorage.token);
          })
          .catch((errors) => {
            slf.textResponse = "Ο χρήστης υπάρχει ήδη";
          })
      }
      if(e.explicitOriginalTarget.defaultValue == 'Εγγραφή'){
        register()
      } else {
        login()
      }
    },
    logout(e){
      e.preventDefault()

      let logout = () => {
        axios.post(helper.BASE_URL + '/logout', null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
          .then((response) => {
            this.showLogin = true;
          })
          .catch((errors) => {
            console.log("Already logged out"); // should only ever go here if token expired
          })
      }
      logout()
    }
  },
  mounted(){
    axios.post(helper.BASE_URL + '/authorized', null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
      .then(res => {
        this.showLogin = false;
      })
      .catch((errors) => {
        this.showLogin = true;
      })
  }
}
</script>
<style scoped>
.login {
  position: absolute;
  left: 0;
  top: 0;
  border: 0px none;
  padding: 0px;
  background-color: aqua
}
</style>
