<template>
  <div id="app">
    <h1>MCMANAGER</h1>
    <div>
      <router-link to="/home">Home</router-link>
      <router-link to="/">Login</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import axios from 'axios';

@Component({
  components: {
    Login,
    Home
  }
})
export default class App extends Vue {}
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
