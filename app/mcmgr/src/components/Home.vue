<template>
  <div class="home">
      <h1>WELCOME TO MCMGR</h1>
      <button v-on:click="logout">Logout</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import router from '../router';
import axios from 'axios';

@Component
export default class Home extends Vue {
  logout() {
    axios.get('http://localhost:3000/api/logout', { withCredentials: true })
        .then(res => {
            this.$router.push('/');
        })
        .catch(e => {
            console.log(e);
        });
  }
}
</script>

<style scoped>
</style>
