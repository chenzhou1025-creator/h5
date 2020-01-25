import { mapState, mapMutations, mapActions } from 'vuex';
import { getListByQueueCode, saveOne } from '@/utils/api/familyDoctor'
import { formatUnixT, isJSON } from './index'
export default {
    watch: {
        'messages.length': 'scrollBottom',
        isLogin(){
          console.log('登录状态变化', this.isLogin)
          if(this.isLogin){
            this.$toast.clear();
          }
        },
        SDKready(){
          this.onchange(this.SDKready)
        }
    },
    computed: {
      ...mapState({
        conversationID: state => state.chatStore.conversationID,
        isLogin: state => state.chatStore.isLogin,
        conversationList: state => state.chatStore.conversationList,
        groupList: state => state.chatStore.groupList,
      }),
      SDKready: function(){
        console.log('this.isLogin', this.isSDKReady, this.isLogin )
        return (this.isLogin && this.isSDKReady)
      }
    },
    methods: {
      ...mapMutations(['addMessage', 'clearMessage', 'updateConversationList', 'historyPushMessages']),
      ...mapActions(['checkoutConversation']),
      //  搜索群组是否存在
        searchGroupByID (groupID) {
          console.log(groupID)
            let _this = this
            this.tim.searchGroupByID(groupID)
              .then((imResponse)=> {
                const group = imResponse.data.group; // 群组信息
                console.log('imResponse群组信息', imResponse)
                if(imResponse.data.group.type == 'Public'){
                  console.log('公开群')
                }
                _this.joinGroup(groupID, imResponse.data.group.type)
              })
              .catch((imError)=> {
                console.warn('searchGroupByID error:', imError); // 搜素群组失败的相关信息
                _this.createGroup(groupID)
              });
          },
          // 创建并加入群聊
        createGroup (groupID) {
            let _this = this
            this.tim.createGroup({
              groupID: groupID,
               type: this.TIM.TYPES.GRP_PUBLIC,  //  GRP_PUBLIC
                name: '诊室',
                joinOption: this.TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS,
                memberList: [{userID: _this.currentVisit.doctorCode}, {userID: _this.currentVisit.userCode}]
            })
              .then((imResponse)=> {
                const group = imResponse.data.group; // 群组信息
                console.log('createGroup', imResponse)
                _this.checkoutConversation2(_this.currentVisit.groupID)
              })
              .catch((imError)=> {
                console.warn('createGroupByID error:', imError); // 创建群组失败的相关信息
              });
          },
        joinGroup (groupID, groupType){
          console.log('加群处理')
            let _this = this
            console.log(this.conversationList, groupID)
            // 查看是否在群里时 查看会话列表跟群组列表
            let index = this.conversationList.findIndex((v)=>{
              return v.type == 'GROUP' && v.groupProfile.groupID == groupID
            })
            let index2 = this.groupList.findIndex((v)=>{
              // console.log(v.groupID)
              return v.groupID == groupID
            })
            console.log(index, index2)
            if(index >= 0 || index2 >= 0){
              console.log('已加入群')
              _this.checkoutConversation2(_this.currentVisit.groupID)
              return;
            }
            this.tim.joinGroup({ groupID: groupID, type: groupType })
              .then(function(imResponse) {
                switch (imResponse.data.status) {
                  case _this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: break; // 等待管理员同意
                  case _this.TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
                    console.log('加群成功', imResponse.data.group); // 加入的群组资料
                    _this.checkoutConversation2(_this.currentVisit.groupID)
                    break;
                  default: break;
                }
              }).catch(function(imError){
                console.log('joinGroup error:', imError.code); // 申请加群失败的相关信息
              });
          },
          // 切换聊天对象
          checkoutConversation2(){
            let _this = this
            console.log('this.currentVisit.groupID', this.currentVisit.groupID)
            this.checkoutConversation(this.currentVisit.groupID)
              .then(res=>{
                _this.getListByQueueCode()
              })
          },
          /**
           * 创建自定义消息description字段对象模板
           * @param { Object} param 
           */
        createCustomContent(param){
         return Object.assign({
              subType: '', // 二级类型
              isDiagnosis: false, // 是否属于诊断记录
              diagnosisId: '',
              template: 'text', //  可选模板 text textImage label
              title: '', //  
              subTitle: '',  //
              contentText: '',
              contentImage: [],
              contentLabel: {},
              hasFooter: false,
              footTemplate: '', // textIcon, iconText, btn // 暂时只有textIcon
              footText: ''
          }, param)
        },
        /**
         * 创建自定义消息
         * @param { String } groupID 房间号 
         * @param {* String } type 消息类型 image/file/system/custom 
         * @param {* Object/String } description 消息主题 原content字段
         * @param {* Object } extension  扩展字段
         * @param {* function } callback 回调函数 若需要特殊处理则走回调函数
         */
        createCustomMessage(groupID, type, description, extension, callback){
          if(this.checkCanSendMsg()) return
          var id; // 消息id用来一些消息的特殊处理
          this.saveOne({msgContent: JSON.stringify(description),msgType: type}, (res)=>{
            console.log('resresres', res)
            if(res.code == 0){
              id = res.id
              // 创建message
            let message = this.tim.createCustomMessage({
                to: groupID,
                conversationType: TIM.TYPES.CONV_GROUP,
                payload: {
                  data: type, // 用于标识该消息是骰子类型消息
                  description: JSON.stringify(description), // 图片地址
                  extension: JSON.stringify(Object.assign({id: id}, extension))
                }
              });
              // 发送或处理message
              if(callback){
                callback(message)
              } else {
                this.sendMessage(message)
              }
            } else{
              // 发送消息失败
            }
          })
          
        },
        /**
         * 创建文件消息
         * @param {* String } filePath 
         */
        createImageMessage(filePath){
          this.createCustomMessage(this.currentVisit.groupID, 'image', filePath, '', (msg)=>{
            this.sendMessage(msg)
          })
        },
        checkCanSendMsg(){
          if(!this.currentVisit.code){
              this.$toast.fail('未选择患者')
              return true
          }
          if(this.currentVisit.visitStatus == '400'){
            this.$toast.fail('退诊确认后，医生不可发送消息，开具病历，等操作')
            return true;
          }
          if(this.currentVisit.visitStatus == '200'){
            this.$toast.fail('已结束问诊不可发送消息')
            return true;
          }
          return false
        },
          //  创建text消息
        sendMsg(msg){
          if(this.checkCanSendMsg()) return
          this.saveOne({
            msgContent: msg,
            msgType: 'text'
          })
          let message = this.tim.createTextMessage({
            to: this.currentVisit.groupID,
            conversationType: TIM.TYPES.CONV_GROUP,
            payload: {
              text: msg
            }
          })
          this.sendMessage(message)
        },
        //  发送消息
        sendMessage (message) {
          console.log('message',message)
          this.tim.sendMessage(message)
            .then(imResponse => {
              console.log('消息发送成功',imResponse);
              this.addMessage(imResponse.data.message)
            })
            .catch(imError=>{
              console.warn('sendMessage error:', imError);
            })
        },
            //  保存聊天内容 data - Object
          saveOne (data, callback) {
              saveOne({
                  doctorCode: this.currentVisit.doctorCode,
                  headUrl: this.currentVisit.doctorFilePath,
                  msgContent: data.msgContent,
                  msgType: data.msgType,
                  queueCode: this.currentVisit.code,
                  readStatus: data.readStatus || '0',
                  senderCode: this.currentVisit.userCode,
                  userCode:this.currentVisit.userCode,
              })
              .then(res =>  {
                callback && callback(res.data)
              })
          },
        // 获取历史聊天信息
          getListByQueueCode (){
            let _this = this;
            getListByQueueCode({ queueCode: this.currentVisit.code})
              .then(res=>{
                if(res.data.code === 0) {
                    _this.clearMessage()
                    var list = res.data.list.map((val, index)=>{
                        var obj = Object.create(null)
                        // obj.content = val.msgType == 'text' ? val.msgContent : JSON.parse(val.msgContent)
                        var decodeContent = decodeURIComponent(val.msgContent)
                        obj.content = isJSON(decodeContent) ? JSON.parse(decodeContent) : decodeContent
                        obj.type = val.msgType
                        obj.id = val.id
                        //  时间转换为秒时间戳(同im)
                        obj.time = Math.floor(formatUnixT(val.timestamp)/1000)
                        obj.isSend = (val.userCode == val.senderCode)
                        return obj
                    })
                    _this.historyPushMessages(list)
                    _this.scrollBottom()
                }
            })
        },
         clearCustomTool(){
            this.$refs.customFn.initActiveItem()
          },
    }
}