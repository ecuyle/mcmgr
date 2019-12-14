<template>
  <div v-if="server" class="manage-server">
      <h3>You are managing: {{ server.name }}</h3>
      <p>{{ statusMessage }}</p>
      <button v-on:click="handleStartClick" class="start">Start {{ server.name }}</button>
      <button v-on:click="handleStopClick" class="stop">Stop {{ server.name }}</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { SharedStateStoreInterface } from "../types/SharedStateStore";
import { isUndefinedOrNull } from "../utils";
import { ServerDetails } from "../../../../server/types/MCServersManager";

@Component
export default class Server extends Vue {
  @Prop() server: ServerDetails | null;
  store: SharedStateStoreInterface;
  pid: number | null;
  statusMessage: string;

  constructor() {
    super();
    const { $root: { $data: { store } } } = this;
    this.store = store;
    this.pid = null;
    this.statusMessage = '';
  }

  handleStartClick() {
      const { server: { id } } = this;
      if (isUndefinedOrNull(id)) {
          return;
      }

      this.startServer(id);
  }

  handleStopClick() {
      this.stopServer(this.pid);
  }

  startServer(serverId: number) {
    if (isUndefinedOrNull(serverId)) {
        return;
    }

    const startEvent = {
        serverId,
        topic: 'SERVER_START',
    };

    axios.post('http://localhost:3000/api/events', startEvent)
        .then(({ data: { data }}) => {
            const { pid, message } = data;
            this.pid = pid;
            this.statusMessage = message;
        })
        .catch(err => {
            console.log(err);
        });
  }

  stopServer(pid: number | null) {
      if (pid === null) {
          return;
      }

      const stopEvent = {
          pid,
          topic: 'SERVER_STOP',
      };

      axios.post('http://localhost:3000/api/events', stopEvent)
        .then(({ data: { data }}) => {
            this.pid = null;
            this.statusMessage = data.message;
        })
        .catch(err => {
            console.log(err);
        });
  }
}
</script>

<style scoped>
</style>
