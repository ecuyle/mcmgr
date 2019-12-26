<template>
  <div class="create-server">
    <h3>Create a New Server</h3>
    <input id="name" class="create-server-input" placeholder="Enter server name..." v-model="name" />
    <input
      id="runtime"
      class="runtime-input"
      placeholder="Enter desired runtime..."
      v-model="runtime"
    />
    <input id="isEulaAccepted" type="checkbox" class="eula-input" v-model="isEulaAccepted" />
    <span>Accept EULA?</span>
    <button v-on:click="handleCreateServerClick" class="create-server-btn">Create New Server</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import { HTTP_BASE_ADDR } from '../utils';

export default Vue.extend({
  data() {
    return {
      name: '',
      runtime: '',
      isEulaAccepted: false
    };
  },

  methods: {
    validateCreateServerFields(): boolean {
      if (!this.isEulaAccepted || !this.name || !this.runtime) {
        return false;
      }

      return true;
    },

    resetCreateServerFields(): void {
      this.name = '';
      this.runtime = '';
      this.isEulaAccepted = false;
    },

    createServer(): void {
      const {
        $root: {
          $data: { store }
        }
      } = this;

      const server = {
        userId: store.get('auth.userId'),
        name: this.name,
        runtime: this.runtime,
        isEulaAccepted: this.isEulaAccepted,
        config: {}
      };

      axios
        .post(`${HTTP_BASE_ADDR}/mcsrv`, server, {
          withCredentials: true
        })
        .then(res => {
          this.$emit('createServer');
          this.resetCreateServerFields();
        })
        .catch(err => {
          console.log(err);
        });
    },

    handleCreateServerClick(e: Event) {
      if (this.validateCreateServerFields()) {
        this.createServer();
      } else {
        alert('AH! Make sure all the fields are good');
      }
    }
  }
});
</script>

<style scoped>
</style>
