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
  public ws: WebSocket | null;
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
    this.serverLogs = '';
    this.newCommand = '';
    this.ws = null;
  }

  //---------------------- COMPUTED / WATCHERS ----------------------
  public get serverLogsArr(): Array<string> {
    return this.serverLogs.split('\n');
  }
  
  public get serverId(): number | null {
    const { server } = this;

    if (server === null) {
      return null;
    }

    const { id } = server;

    return Number(id);
  }

  @Watch('server')
  onPropertyChanged(value: ServerDetails, oldValue: ServerDetails): void {
    this.serverLogs = '';
  }

  //---------------------- LIFECYCLE METHODS ----------------------
  public mounted(): void {
    // Setup the onmessage event handler here instead of in
    // the constructor so that the values bind propertly...
    this.ws = new WebSocket(`${WS_BASE_ADDR}/ws/connect`);
    this.ws.onmessage = this.handleWsMessageEvent.bind(this);
  }

  //---------------------- ACTION HANDLERS ----------------------
  public handleClearLogsClick(): void {
    this._clearLogs();
  }

  public handleWsMessageEvent(msg: MessageEvent): void {
    const { data } = msg;
    const chunks = data.split(' ');

    this.serverLogs += `${data}\n`;

    // Scroll to bottom of #server-logs div
    const serverLogsDiv = document.getElementById('server-logs');

    if (serverLogsDiv) {
      // TODO: Still doesnt scroll EXACTLY to the bottom..figure out why
      serverLogsDiv.scrollTop = serverLogsDiv.scrollHeight;
    }
  }

  public handleNewCommandClick(): void {
    const { newCommand, serverId } = this;

    this._sendWsEvent('ISSUE_COMMAND', { command: newCommand });
    this.newCommand = '';
    this.$emit('detectServerChange');
  }

  public handleStartClick(): void {
    const { serverId } = this;

    if (isUndefinedOrNull(serverId)) {
      return;
    }

    this._sendWsEvent('SERVER_START');
    this.$emit('detectServerChange');
  }

  public handleStopClick(): void {
    this._sendWsEvent('SERVER_STOP');
    this.$emit('detectServerChange');
  }

  //---------------------- COMPONENT METHODS ----------------------
  private _clearLogs(): void {
    this.serverLogs = `Cleared logs at ${moment().format(
      'dddd, MMMM Do YYYY, h:mm:ss a'
    )}\n`;
  }

  private _sendWsEvent(topic: string, payload: any = {}): void {
    const { ws, serverId } = this;

    if (isUndefinedOrNull(serverId) || isUndefinedOrNull(ws)) {
      return;
    }

    const event = {
      topic,
      serverId,
    };

    Object.assign(event, payload);

    ws && ws.send(JSON.stringify(event));
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
