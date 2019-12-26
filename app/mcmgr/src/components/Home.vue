<template>
  <div class="home">
    <h1>WELCOME TO MCMGR</h1>
    <button v-on:click="logout">Logout</button>
    <div class="manage-servers">
      <h3>Here are your servers:</h3>
      <ul class="servers-list">
        <li
          v-on:click="handleServerClick"
          :key="server.id"
          class="server"
          v-bind:id="server.id"
          v-for="server in servers"
        >{{ server.name }}</li>
      </ul>
    </div>
    <Server v-bind:server="selectedServer"></Server>
    <CreateServer v-on:createServer="fetchServers()"></CreateServer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import router from '../router';
import axios from 'axios';
import Server from '@/components/Server.vue';
import CreateServer from '@/components/CreateServer.vue';
import { ServerSchemaObject } from '../../../../server/types/MCFileManager';
import { Dictionary } from 'vue-router/types/router';
import { SharedStateStoreInterface } from '../types/SharedStateStore';
import { HTTP_BASE_ADDR } from '../utils';

@Component({
  components: {
    Server,
    CreateServer
  }
})
export default class Home extends Vue {
  servers: Array<ServerSchemaObject>;
  store: SharedStateStoreInterface;
  selectedServer: ServerSchemaObject | null;

  constructor() {
    super();
    this.servers = [];
    const {
      $root: {
        $data: { store }
      }
    } = this;
    this.store = store;
    this.selectedServer = null;
  }

  mounted() {
    const userId = this.store.get('auth.userId');

    if (userId === undefined || userId === null) {
      this.$router.push('/');
      return;
    }

    this.fetchServers();
  }

  handleServerClick(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const { id } = target;
    this.getServerDetails(+id);
  }

  getServerDetails(serverId: number) {
    axios
      .get(`${HTTP_BASE_ADDR}/mcsrv/detail?serverId=${serverId}`)
      .then(({ data: { data } }) => {
        this.selectedServer = data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  fetchServers() {
    const userId = this.store.get('auth.userId');
    axios
      .get(`${HTTP_BASE_ADDR}/mcsrv?userId=${userId}`, {
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
      .get(`${HTTP_BASE_ADDR}/auth/logout`, { withCredentials: true })
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
