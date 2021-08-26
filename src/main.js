import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import i18n from './includes/i18n'

Vue.config.productionTip = false

require('./assets/scss/style.scss');

new Vue({
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')
