<template>
  <div class="home">
    <h1>WELCOME TO MCMGR</h1>
    <button v-on:click="logout">Logout</button>
    <div>
      <h3>Here are your servers:</h3>
      <ul class="servers">
        <li :key="server" v-for="server in servers">{{ server.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import router from "../router";
import axios from "axios";
import { ServerSchemaObject } from "../../../../server/types/MCFileManager";
import { Dictionary } from "vue-router/types/router";
import { SharedStateStoreInterface } from "../types/SharedStateStore";

@Component
export default class Home extends Vue {
  servers: Array<ServerSchemaObject>;
  store: SharedStateStoreInterface;

  constructor() {
    super();
    this.servers = [];
    const { $root: { $data: { store } } } = this;
    this.store = store;
  }

  mounted() {
    const userId = this.store.get('auth.userId');

    if (userId === undefined || userId === null) {
      this.$router.push('/');
      return;
    }

    this.fetchServers();
  }

  fetchServers() {
    const userId = this.store.get('auth.userId');
    axios
      .get(`http://localhost:3000/api/mcsrv?userId=${userId}`, {
        withCredentials: true
      })
      .then(({ data: { data } }) => {
        this.servers = data;
      })
      .catch(err => {
        console.log(err);
        this.store.set('auth.userId', null);
        this.$router.push('/');
      });
  }

  logout() {
    axios
      .get('http://localhost:3000/api/logout', { withCredentials: true })
      .then(() => {
        this.store.set('auth.userId', null);
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
