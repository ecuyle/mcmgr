<template>
  <div v-if="server" class="manage-server">
    <h3>You are managing: {{ server.name }}</h3>
    <button v-on:click="handleStartClick" class="start">Start {{ server.name }}</button>
    <button v-on:click="handleStopClick" class="stop">Stop {{ server.name }}</button>
    <div class="server-logs" id="server-logs">
      <p v-for="(log, index) in serverLogsArr" :key="index">{{ log }}</p>
    </div>
    <div class="issue-command">
      <input class="new-command-input" placeholder="Enter a command..." v-model="newCommand" />
      <span>
        <button class="new-command-btn" @click="handleNewCommandClick">Issue command</button>
      </span>
      <span>
        <button class="clear-logs-btn" @click="handleClearLogsClick">Clear Logs</button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import moment from 'moment';
import { SharedStateStoreInterface } from '../types/SharedStateStore';
import { isUndefinedOrNull, WS_BASE_ADDR } from '../utils';
import { ServerDetails } from '../../../../types/base';

@Component
export default class Server extends Vue {
  //---------------------- PROPS  ----------------------
  @Prop() server: ServerDetails | null;

  //---------------------- DATA ----------------------
  public store: SharedStateStoreInterface;
  public pid: number | null;
  public ws: WebSocket;
  public serverLogs: string;
  public newCommand: string;

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
    this.ws = new WebSocket(`${WS_BASE_ADDR}/ws/connect`);
  }

  //---------------------- COMPUTED / WATCHERS ----------------------
  public get serverLogsArr(): Array<string> {
    return this.serverLogs.split('\n');
  }

  @Watch('server')
  onPropertyChanged(value: ServerDetails, oldValue: ServerDetails): void {
    this.serverLogs = '';
    this.pid = null;
  }

  //---------------------- LIFECYCLE METHODS ----------------------
  public mounted(): void {
    // Setup the onmessage event handler here instead of in
    // the constructor so that the values bind propertly...
    this.ws.onmessage = this.handleWsMessageEvent.bind(this);
  }

  //---------------------- ACTION HANDLERS ----------------------
  public handleClearLogsClick(): void {
    this._clearLogs();
  }

  public handleWsMessageEvent(msg: MessageEvent): void {
    const { data } = msg;
    const chunks = data.split(' ');

    // Sets pid if not set yet. This is needed so that the server can be
    // stopped later on.
    if (this.pid === null) {
      this.pid = (chunks[0] === '[init]' && +chunks[chunks.length - 1]) || null;
    }

    this.serverLogs += `${data}\n`;

    // Scroll to bottom of #server-logs div
    const serverLogsDiv = document.getElementById('server-logs');

    if (serverLogsDiv) {
      // TODO: Still doesn't scroll EXACTLY to the bottom..figure out why
      serverLogsDiv.scrollTop = serverLogsDiv.scrollHeight;
    }
  }

  public handleNewCommandClick(): void {
    const { newCommand, pid } = this;

    this._issueCommand(newCommand, pid);
  }

  public handleStartClick(): void {
    const { server } = this;

    if (!server) {
      return;
    }

    const { id }: ServerDetails = server;

    if (isUndefinedOrNull(id)) {
      return;
    }

    this._startServer(id);
  }

  public handleStopClick(): void {
    this._stopServer(this.pid);
  }

  //---------------------- COMPONENT METHODS ----------------------
  private _clearLogs(): void {
    this.serverLogs = `Cleared logs at ${moment().format(
      'dddd, MMMM Do YYYY, h:mm:ss a'
    )}\n`;
  }

  private _issueCommand(command: string, pid: number | null): void {
    if (pid === null) {
      return;
    }

    const issueEvent = {
      topic: 'ISSUE_COMMAND',
      command,
      pid
    };

    this.ws.send(JSON.stringify(issueEvent));
    this.newCommand = '';
  }

  private _startServer(serverId: number): void {
    if (isUndefinedOrNull(serverId)) {
      return;
    }

    const startEvent = {
      serverId,
      topic: 'SERVER_START'
    };

    this.ws.send(JSON.stringify(startEvent));
  }

  private _stopServer(pid: number | null): void {
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
