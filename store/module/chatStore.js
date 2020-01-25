/**
 * 聊天室store
 * message: {
    *          content:'',
    *          type: '',
    *          id: '',
    *          isSend: ''
    *          senderCode: ''
*            }
 */
import Vue from 'vue'
import router from '../../router/index'
import { getLoginInfo2 } from '@/utils/api/familyDoctor'
import store from '../index'
import Toast from 'vant'
// 过滤*IM*聊天信息  不兼容聊天历史记录
function filterMessage(message, ownId){
    var obj = {}
    obj.content = message.type == TIM.TYPES.MSG_TEXT ? message.payload.text : message.type == TIM.TYPES.MSG_CUSTOM ? JSON.parse(message.payload.description) : ''
    obj.type = message.type == TIM.TYPES.MSG_TEXT ? 'text' : message.type == TIM.TYPES.MSG_CUSTOM ? message.payload.data : ''
    obj.id = message.type == TIM.TYPES.MSG_TEXT ? message.ID : message.payload.extension ? JSON.parse(message.payload.extension).id : message.ID
    obj.isSend = message.from == ownId
    obj.time= message.time
    console.log('messageObj', store)
    if(!obj.isSend && obj.type == 'text'){
      var replyCount = store.state.conversation.currentVisit.replyCount*1 - 1
       store.commit('updateCurVisit', {replyCount: replyCount})
    }
    store.commit('changeCurrentLastMessage', obj)
    return obj
}
export default {
    state: {
        rtcInfo: {},
        isLogin: false,
        isSDKReady: false, // TIM SDK 是否 ready
        messages: [], //  聊天记录
        currentConversation:{},
        conversationList: [],
        groupList: [],
        currentLastMessage: {}, // 当前会话对方发送的最后一条信息 用来处理接收到system/custom消息后做的一些处理
        unread: {} //  房间号：数量 /=>所有未读计数
    },
    getters: {
        // 计算所有未读消息总数  弃用
        totalUnreadCount: state => {
            return state.conversationList.reduce((count, conversation) => {
              // 当前会话不计算总未读
              if (conversation.conversationID === state.currentConversation.conversationID) {
                return count
              }
              if (
                conversation.type === 'GROUP' &&
                conversation.groupProfile.selfInfo.messageRemindType === 'AcceptNotNotify'
              ) {
                return count
              }
              return count + conversation.unreadCount
            }, 0)
        },
        // 用于当前会话的图片预览
        imgUrlList: state => {
            return state.messages
            .filter(message => message.type === 'image')
            .map(message => JSON.parse(message.content))
        }
    },
    mutations: {
        addMessage(state, data){
            // 还没当前会话，则跳过  todo conversationID 修改为当前房间id字段
            // if (!state.currentConversation.conversationID) {
            //     return
            // }
            console.log('message111111111', data, state.currentConversation, Array.isArray(data))
            if (Array.isArray(data)) {
                // 筛选出当前会话的非系统消息 非当前会话做未读计数不计入tim系统消息
                data.forEach((item)=>{
                    if(item.conversationID === state.currentConversation.conversationID && item.from.indexOf('@TIM') == -1){
                        state.messages = [...state.messages, filterMessage(item, state.rtcInfo.userID)]
                    } else {
                        //  未读计数
                        if(item.conversationType == 'GROUP' && item.from.indexOf('@TIM') == -1) state.unread[item.to] ? state.unread[item.to] = ++state.unread[item.to] : Vue.set(state.unread, item.to, 1)
                    }
                })
            } else if (data.conversationID === state.currentConversation.conversationID  && data.from.indexOf('@TIM') == -1) {
                console.log('message222', state.currentConversation)
                state.messages = [...state.messages, filterMessage(data, state.rtcInfo.userID)]
            } else {
                //  未读计数
                if(data.conversationType == 'GROUP' && data.from.indexOf('@TIM') == -1)state.unread[data.to] ? state.unread[data.to] = ++state.unread[data.to] : Vue.set(state.unread, data.to, 1)
            }
        },
        // 根据房间号清除未读计数  data==groupId
        clearUnRead(state, data){
            Vue.set(state.unread, data, 0)
        },
        // 历史记录直接填入messages
        historyPushMessages(state, data){
            state.messages = [...data]
        },
        //  更新签名信息
        updateRtcInfo(state, rtcInfo) {
            state.rtcInfo = rtcInfo
        },
        // 改变当前会话最后一条消息
        changeCurrentLastMessage(state, data){
            state.currentLastMessage = Object.assign({}, data)
        },
        /**
     * 更新当前会话
     * 调用时机: 切换会话时
     * @param {Object} state
     * @param {Conversation} conversation
     */
        updateCurrentConversation(state, conversation) {
            state.currentConversation = conversation
            // state.nextReqMessageID = ''
            // state.isCompleted = false
        },
        toggleIsLogin(state, isLogin) {
            state.isLogin = typeof isLogin === 'undefined' ? !state.isLogin : isLogin
        },
        toggleIsSDKReady(state, isSDKReady) {
            state.isSDKReady = typeof isSDKReady === 'undefined' ? !state.isSDKReady : isSDKReady
        },
        clearMessage(state, message){
            state.messages = []
        },
        /**
     * 更新会话列表
     * 调用时机：触发会话列表更新事件时。CONVERSATION_LIST_UPDATED
     * @param {Object} state
     * @param {Conversation[]} conversationList
     */
        updateConversationList(state, conversationList) {
            state.conversationList = conversationList
        },
        updateGroupList(state, groupList) {
            state.groupList = groupList
        },
        reset(state){
            Object.assign(state, {
                currentUserProfile: {},
                isLogin: false,
                isSDKReady: false,
                conversationList: [],
                groupList: [],
                currentConversation:{},
              })
        }
    },
    actions: {
        getTimSign(context, param){
            getLoginInfo2({userID: param.userID})
                .then(res=>{
                    console.log(res.data)
                    context.commit('updateRtcInfo', res.data)
                    context.dispatch('timLogin', res.data)
                })
        },
        timLogin(context, param) {
            Vue.prototype.$toast.loading()
            context.commit('toggleIsLogin')
            context.commit('reset')
            // return;
            Vue.prototype.tim.login({
                    userID: param.userID,
                    userSig: param.userSig
                })
                .then(() => {
                    Vue.prototype.$toast.clear()
                    context.commit('toggleIsLogin', true)
                    // context.commit('startComputeCurrent')
                })
                .catch(imError => {
                    if (imError.code === 2000) {
                        window.$message.error(imError.message + ', 请检查是否正确填写了 SDKAPPID')
                    } else {
                        window.$message.error(imError.message)
                    }
                })
        },
        logout(context) {
            Vue.prototype.tim.logout().then(() => {
                context.commit('toggleIsLogin')
                // context.commit('stopComputeCurrent')
                context.commit('reset')
            })
        },
        //  初始化兼听
        initListener({commit, dispatch, state}, param) {
            console.log('成功成功咯吧')
            commit('toggleIsSDKReady')
            // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.SDK_READY, ({ name }) => {
                console.log('登录成功')
                const isSDKReady = name === Vue.prototype.TIM.EVENT.SDK_READY ? true : false
                commit('toggleIsSDKReady', isSDKReady)
                Vue.prototype.$toast.clear()
                if (isSDKReady) {
                    Vue.prototype.tim.getMyProfile().then(({ data }) => {
                        console.log('getMyProfile', data)
                        // this.$store.commit('updateCurrentUserProfile', data)
                      })
                //   dispatch('getBlacklist')
                }
              }, this)
            // SDK NOT READT
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.SDK_NOT_READY, ({ name }) => {
                console.log('登录成功')
                Vue.prototype.$toast.clear()
                const isSDKReady = name === Vue.prototype.TIM.EVENT.SDK_READY ? true : false
                commit('toggleIsSDKReady', isSDKReady)
          
                if (isSDKReady) {
                    Vue.prototype.tim.getMyProfile().then(({ data }) => {
                        console.log('getMyProfile', data)
                        // this.$store.commit('updateCurrentUserProfile', data)
                      })
                }
              }, this)
            // 被踢出
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.KICKED_OUT, ({data:{type}}) => {
              const message = type === Vue.prototype.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT ? '您的账号已在其他页面登录' : '您的账号已在其他设备登录'
              console.error({content: message})
              // sessionStorage.cardNo = null
              // commit('toggleIsLogin', false)
              commit('reset')
              Vue.prototype.$dialog.confirm({
                title: '系统提示',
                message: '您的账号已在其他设备登录',
                onConfirm: () => {
                  router.replace('/login')
                },
                onCancel: () => {
                    this.activeItem = ''
                }
            });
            })
            // SDK内部出错
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.ERROR, ({ data: error }) =>{
                if(!sessionStorage.getItem('cardNo')) return
                console.log('errorerrorerror',error.code)
                console.error({
                    code: error.code,
                    content: error.message,
                  })
                  switch (error.code) {
                      case 2999:
                          console.log('接口调用时机不合理2999')
                          commit('reset')
                          if(!sessionStorage.getItem('cardNo')) return
                          Vue.prototype.$dialog.confirm({
                              title: '系统提示',
                              message: '您的聊天已断开，点击确认重新连接'
                          }).then(() => {
                            dispatch('getTimSign', {userID: sessionStorage.getItem('mobile')})
                          }).catch(() => {});
                          break;
                      case 70221:
                          console.log('重新登录')
                          dispatch('logout')
                          commit('reset')
                          if(!sessionStorage.getItem('cardNo')) return
                          Vue.prototype.$dialog.confirm({
                              title: '系统提示',
                              message: '您的聊天已断开，点击确认重新连接',
                          }).then(() => {
                            dispatch('getTimSign', {userID: sessionStorage.getItem('mobile')})
                          }).catch(() => {});
                          break;
                      case 70001:
                          dispatch('logout')
                          commit('reset')
                          if(!sessionStorage.getItem('cardNo')) return
                         Vue.prototype.$dialog.confirm({
                              title: '系统提示',
                              message: '您的聊天已断开，点击确认重新连接',
                          }).then(() => {
                            dispatch('getTimSign', {userID: sessionStorage.getItem('mobile')})
                          }).catch(() => {});
                          console.log('签名失效')
                          break;
                      default:
                          console.log('default') 
                  }
              })
            // 收到新消息
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.MESSAGE_RECEIVED, ({ data: messageList })=>{
                console.log('收到新消息', messageList)
                commit('addMessage', messageList)
            })
            // 会话列表更新
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.CONVERSATION_LIST_UPDATED, event => {
                // console.log('updateConversationList', event.data)
              // commit('updateConversationList', event.data)
            })
            // 群组列表更新
            Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.GROUP_LIST_UPDATED, event => {
              //   console.log('updateGroupList', event.data)
              // commit('updateGroupList', event.data)
            })
            // // 收到新的群系统通知
            // Vue.prototype.tim.on(Vue.prototype.TIM.EVENT.GROUP_SYSTEM_NOTICE_RECERIVED, event => {
            //   const isKickedout = event.data.type === 4
            //   const isCurrentConversation =
            //     `GROUP${event.data.message.payload.groupProfile.groupID}` === currentConversation.conversationID
            //   // 在当前会话被踢，需reset当前会话
            //   if (isKickedout && isCurrentConversation) {
            //     // commit('resetCurrentConversation')
            //   }
            //   console.log('收到新的群系统通知', translateGroupSystemNotice(event.data.message))
            // //   Notification({
            // //     title: '新系统通知',
            // //     message: translateGroupSystemNotice(event.data.message),
            // //     duration: 3000,
            // //     onClick: () => {
            // //       const SystemConversationID = '@TIM#SYSTEM'
            // //       dispatch('checkoutConversation', SystemConversationID)
            // //     }
            // //   })
            // })
          },
           /**
     * 切换会话
     * 调用时机：切换会话时
     * @param {Object} context
     * @param {String} conversationID
     */
    checkoutConversation(context, conversationID) {
        // context.commit('resetCurrentMemberList')
        // 1.切换会话前，将切换前的会话进行已读上报
        // if (context.state.currentConversation.conversationID) {
        //   const prevConversationID = context.state.currentConversation.conversationID
        //   tim.setMessageRead({ conversationID: prevConversationID })
        // }
        // 2.待切换的会话也进行已读上报
        // tim.setMessageRead({ conversationID })
        // 3. 获取会话信息
        return Vue.prototype.tim.getConversationProfile('GROUP' + conversationID).then(({ data }) => {
          // 3.1 更新当前会话
          console.log('updateCurrentConversation', data.conversation)
          context.commit('updateCurrentConversation', data.conversation)
          // 3.2 获取消息列表
        //   context.dispatch('getMessageList', conversationID)
          // 3.3 拉取第一页群成员列表
        //   if (data.conversation.type === TIM.TYPES.CONV_GROUP) {
        //     return context.dispatch('getGroupMemberList', data.conversation.groupProfile.groupID)
        //   }
          return Promise.resolve()
        })
      }
    }
}