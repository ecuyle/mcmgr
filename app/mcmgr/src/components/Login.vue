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
import { SharedStateStoreInterface } from '../types/SharedStateStore';

@Component
export default class Login extends Vue {
  store: SharedStateStoreInterface;

  constructor() {
    super();
    const { $root: { $data: { store } } } = this;
    this.store = store;
  }

  auth() {
    const { $root: { $data: { sharedState } } } = this;
    const username: string = (<HTMLInputElement>document.getElementById('username')).value;
    const password: string = (<HTMLInputElement>document.getElementById('password')).value;
    const credentials = {
      username,
      password,
    };

    axios.post('http://localhost:3000/api/login', credentials, { withCredentials: true })
      .then(res => {
        this.store.set('auth.userId', res.data.id);
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
