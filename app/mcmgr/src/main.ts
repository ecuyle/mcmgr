import Vue from 'vue'
import App from './App.vue'
import router from './router';
import VueCookies from 'vue-cookies';
import { SharedStateStore } from './SharedStateStore';

Vue.use(VueCookies);

Vue.config.productionTip = false;

const data = {
  store: new SharedStateStore({
    auth: {
      userId: null,
    },
  }),
};

new Vue({
  router,
  data,
  render: h => h(App),
}).$mount('#app')
