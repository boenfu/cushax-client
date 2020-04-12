import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import CushaxClient from 'cushax-client'

Vue.config.productionTip = false

Vue.use(CushaxClient())

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
