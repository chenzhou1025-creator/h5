import load from '../../components/common/loading/loading.vue'
import Vue from 'vue'

var loading = Vue.extend(load)
let instance = null
//  插件调用两种方式
export default (options) => {
  instance || (instance = new loading({
    el: document.createElement('div')
  }))
  instance.loadings = options
  document.body.appendChild(instance.$el)
}