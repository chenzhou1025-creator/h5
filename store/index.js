import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"
Vue.use(Vuex)
/**
 * @desc 导入需要的store
 * @author Wenjing
 */
import commonStore from './module/commonStore'
import chatStore from './module/chatStore'
import conversation from './module/conversation'

// Vue.use(Vuex)
export default new Vuex.Store({

    modules: {
        commonStore,
        chatStore,
        conversation
    },
    plugins: [createPersistedState()]
})