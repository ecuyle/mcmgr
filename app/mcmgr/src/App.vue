<template>
  <div id="app">
    <nav>
      <div class="nav-wrapper">
        <a href="#" class="brand-logo">MCMgr: Minecraft Manager</a>
        <ul id="nav-mobile" class="right hide-on-med-and-down">
          <li>
            <router-link to="/home">Home</router-link>
          </li>
          <li>
            <router-link to="/">Login</router-link>
          </li>
        </ul>
      </div>
    </nav>
    <div class="content">
      <router-view />
    </div>
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
}

.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0px 25px 25px 25px;
}
</style>
