<template>
  <div class="login">
    <label>Username</label>
    <input id="username" />
    <label>Password</label>
    <input id="password" type="password" />
    <button v-on:click="auth">Login</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';

@Component
export default class Login extends Vue {
  auth() {
    const { value: username }: HTMLInputElement = (<HTMLInputElement>document.getElementById('username'));
    const { value: password }: HTMLInputElement = (<HTMLInputElement>document.getElementById('password'));
    const credentials = {
      username,
      password,
    };

    axios.post('http://localhost:3000/api/login', credentials, { withCredentials: true })
      .then(res => {
        this.$router.push('/home');
      })
      .catch(e => {
        alert(e);
      });
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  width: 50%;
}
</style>
