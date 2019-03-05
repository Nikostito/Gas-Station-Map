<template>
  <div class>
    <div v-show="showComponent" class="login">
      <div v-show="showLogin">
        <button class="button" @click="showComp()">Απόκρυψη<<</button><br>
        <form v-on:submit="login">
            <input type="text" name="username" placeholder="όνομα χρήστη"/><br>
            <input type="password" name="password" placeholder="κωδικός χρήστη"/><br>
            <input type="submit" value="Είσοδος"/><br>
            <input type="submit" value="Εγγραφή"/>
            <h3 v-if="textResponse" v-bind:class="{ wrongText: !isRight, rightText: isRight }">{{textResponse}}</h3>
        </form>
      </div>
      <div v-show="!showLogin">
        <form v-on:submit="logout">
            <input type="submit" value="Αποσύνδεση"/>
        </form>
        <transition name="slide-fade">
          <p v-if="showLogin" class="rightText">Επιτυχής Σύνδεση</p>
        </transition>
      </div>
    </div>
    <div v-show="!showComponent" class="login">
      <button class="button" @click="showComp()">Είσοδος>></button>
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
      showComponent:false,
      textResponse:'',
      isRight:false
    }
  },
  methods: {
    showComp(){
      this.showComponent = !this.showComponent;
    },
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
          this.isRight=false;
          slf.textResponse = "Λάθος όνομα χρήστη/συνθηματικού";
          setTimeout(function(){ slf.textResponse = ""; }, 3000);
        })
      }
      let register = () => {
        let data = {
          username: username,
          password: password
        }

        axios.post(helper.BASE_URL + '/signup', data)
          .then((response) => {
            this.isRight=true;
            slf.textResponse = 'Επιτυχής εγγραφή';
            setTimeout(function(){ slf.textResponse = ""; }, 3000);
            // console.log(localStorage.token);
          })
          .catch((errors) => {
            this.isRight=false;
            slf.textResponse = "Ο χρήστης υπάρχει ήδη";
            setTimeout(function(){ slf.textResponse = ""; }, 3000);
          })
      }
      if(e.explicitOriginalTarget.defaultValue == 'Εγγραφή'){
        register()
      } 
      if(e.explicitOriginalTarget.defaultValue == 'Είσοδος'){
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
input[type=text], input[type=password]{
  width: 120px;
}

input[type=button], input[type=submit], input[type=reset], button{
  background-color: rgb(37, 25, 146);
  border-color: aliceblue;
  color: white;
  padding: 2px 16px;
  text-decoration: none;
  margin: 4px 2px;
  cursor: pointer;
}
.login {
  position: absolute;
  left: 0;
  top: 0;
  border: 0px none;
  padding: 0px;
  background-color: rgb(20, 11, 100);
  z-index: 1000;
}
.wrongText{
  position: fixed;
  color: crimson;
  background-color: white;
  border-radius: 25px;
  border: 1px solid crimson;
  padding: 5px;
}
.rightText{
  position: fixed;
  color: rgb(4, 238, 24);
  background-color: white;
  border-radius: 25px;
  border: 1px solid rgb(4, 238, 24);
  padding: 5px;
}
.slide-fade-enter-active {
  transition: all 2s ease;
}
.slide-fade-leave-active {
  transition: all 4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
</style>
