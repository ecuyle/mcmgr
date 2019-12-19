<template>
  <div v-if="server" class="manage-server">
    <h3>You are managing: {{ server.name }}</h3>
    <button v-on:click="handleStartClick" class="start">Start {{ server.name }}</button>
    <button v-on:click="handleStopClick" class="stop">Stop {{ server.name }}</button>
    <div class="server-logs" id="server-logs">
      <p v-for="(log, index) in serverLogsArr" :key="index">{{ log }}</p>
    </div>
    <div class="issue-command">
      <input class="new-command-input" v-model="newCommand" />
      <span>
        <button class="new-command-btn" @click="handleNewCommandClick">Issue command</button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { SharedStateStoreInterface } from '../types/SharedStateStore';
import { isUndefinedOrNull } from '../utils';
import { ServerDetails } from '../../../../types/base';

@Component
export default class Server extends Vue {
  @Prop() server: ServerDetails | null;
  store: SharedStateStoreInterface;
  pid: number | null;
  ws: WebSocket;
  serverLogs: string;
  newCommand: string;

  constructor() {
    super();
    const {
      $root: {
        $data: { store }
      }
    } = this;
    this.server = null;
    this.store = store;
    this.pid = null;
    this.serverLogs = '';
    this.newCommand = '';
    this.ws = new WebSocket('ws://localhost:3000/api/ws/connect');
  }

  get serverLogsArr(): Array<string> {
    return this.serverLogs.split('\n');
  }

  @Watch('server')
  onPropertyChanged(value: ServerDetails, oldValue: ServerDetails): void {
    this.serverLogs = '';
    this.pid = null;
  }

  handleNewCommandClick(): void {
    const issueEvent = {
      topic: 'ISSUE_COMMAND',
      command: this.newCommand,
      pid: this.pid
    };

    this.ws.send(JSON.stringify(issueEvent));
  }

  handleStartClick(): void {
    const { server } = this;

    if (!server) {
      return;
    }

    const { id }: ServerDetails = server;

    if (isUndefinedOrNull(id)) {
      return;
    }

    this.startServer(id);
  }

  handleStopClick(): void {
    this.stopServer(this.pid);
  }

  startServer(serverId: number): void {
    if (isUndefinedOrNull(serverId)) {
      return;
    }

    // Setup the onmessage event handler here instead of in
    // the constructor so that the values bind propertly...
    this.ws.onmessage = (msg: MessageEvent) => {
      const { data } = msg;
      const chunks = data.split(' ');

      // Sets pid if not set yet. This is needed so that the server can be
      // stopped later on.
      if (this.pid === null) {
        this.pid =
          (chunks[0] === '[init]' && +chunks[chunks.length - 1]) || null;
      }

      this.serverLogs += `${data}\n`;

      // Scroll to bottom of #server-logs div
      const serverLogsDiv = document.getElementById('server-logs');

      if (serverLogsDiv) {
        serverLogsDiv.scrollTop = serverLogsDiv.scrollHeight;
      }
    };

    const startEvent = {
      serverId,
      topic: 'SERVER_START'
    };

    this.ws.send(JSON.stringify(startEvent));
  }

  stopServer(pid: number | null): void {
    if (pid === null) {
      return;
    }

    const stopEvent = {
      pid,
      topic: 'SERVER_STOP'
    };

    this.ws.send(JSON.stringify(stopEvent));
    this.pid = null;
  }
}
</script>

<style scoped>
.server-logs {
  height: 200px;
  min-width: 500px;
  overflow-y: auto;
  border: 1px solid black;
  text-align: start;
}
</style>
