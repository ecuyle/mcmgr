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
    <div class="create-server">
      <h3>Create a New Server</h3>
      <input
        id="newServerName"
        class="create-server-input"
        placeholder="Enter server name..."
        v-model="newServerName"
      />
      <input
        id="newServerRuntime"
        class="runtime-input"
        placeholder="Enter desired runtime..."
        v-model="newServerRuntime"
      />
      <input id="newServerEula" type="checkbox" class="eula-input" v-model="newServerEula" />
      <span>Accept EULA?</span>
      <button v-on:click="handleCreateServerClick" class="create-server-btn">Create New Server</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import router from '../router';
import axios from 'axios';
import Server from '@/components/Server.vue';
import { ServerSchemaObject } from '../../../../server/types/MCFileManager';
import { Dictionary } from 'vue-router/types/router';
import { SharedStateStoreInterface } from '../types/SharedStateStore';

@Component({
  components: {
    Server
  }
})
export default class Home extends Vue {
  servers: Array<ServerSchemaObject>;
  store: SharedStateStoreInterface;
  newServerName: string;
  newServerRuntime: string;
  newServerEula: boolean;
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
    this.newServerName = '';
    this.newServerRuntime = '';
    this.newServerEula = false;
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
      .get(`http://localhost:3000/api/mcsrv/detail?serverId=${serverId}`)
      .then(({ data: { data } }) => {
        this.selectedServer = data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  validateCreateServerFields() {
    if (!this.newServerEula || !this.newServerName || !this.newServerRuntime) {
      return false;
    }

    return true;
  }

  resetCreateServerFields() {
    this.newServerName = '';
    this.newServerRuntime = '';
    this.newServerEula = false;
  }

  createServer() {
    const server = {
      userId: this.store.get('auth.userId'),
      name: this.newServerName,
      runtime: this.newServerRuntime,
      isEulaAccepted: this.newServerEula,
      config: {}
    };

    axios
      .post('http://localhost:3000/api/mcsrv', server, {
        withCredentials: true
      })
      .then(res => {
        this.fetchServers();
        this.resetCreateServerFields();
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleCreateServerClick(e: Event) {
    if (this.validateCreateServerFields()) {
      this.createServer();
    } else {
      alert('AH! Make sure all the fields are good');
    }
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
