import Vue from 'vue'
import AppTask from './AppTask.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(AppTask),
}).$mount('#app')
