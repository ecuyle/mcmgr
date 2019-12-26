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
    <label>
      <input
        id="isEulaAccepted"
        for="isEulaAccepted"
        type="checkbox"
        class="eula-input"
        v-model="isEulaAccepted"
      />
      <span>Accept EULA?</span>
    </label>
    <button v-on:click="handleCreateServerClick" class="create-server-btn">Create New Server</button>
    <span v-if="isLoading">
      <div class="lds-dual-ring"></div>
    </span>
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
      isEulaAccepted: false,
      isLoading: false
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

      this.isLoading = true;

      axios
        .post(`${HTTP_BASE_ADDR}/mcsrv`, server, {
          withCredentials: true
        })
        .then(res => {
          this.isLoading = false;
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
element {
  --main-spinner-color: rgb(29, 141, 132);
}

.lds-dual-ring {
  display: inline-block;
  width: 20px;
  height: 20px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 20px;
  height: 20px;
  margin: 5px;
  border-radius: 50%;
  border: 4px solid rgb(29, 141, 132);
  border-color: rgb(29, 141, 132) transparent rgb(29, 141, 132) transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
