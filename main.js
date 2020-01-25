import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import Http from './utils/js/http.js'
import tim from './tim'
import TIM from 'tim-js-sdk'
import {
  Lazyload,
  Toast,
  Dialog
} from 'vant';
Vue.use(Lazyload);
Vue.use(Toast);
Vue.use(Dialog);
// import '@/permission' // permission control

window.tim = tim
window.TIM = TIM
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM

Vue.config.productionTip = false
Vue.prototype.$Http = Http // get

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')