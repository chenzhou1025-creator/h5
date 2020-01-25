/**
 * 仅仅适用于直播聊天室
 */
import httpApi from './http'
import _ from 'lodash'
import store from '../../store'
// import { MessageBox } from 'vant';
var MessageBox;
// import iView from 'iview'
const IM = {
    webim: window.webim,
    user: null, //  用户信息
    isLogOn: false, //  是否打印日志
    isAccessFormalEnv: true, //  是否访问正式环境
    sendToId: null, // 当前聊天房间号
    sendToName: null, // 当前聊天房间名称
    applyGroup: [], //  已加入的群聊
    MemberList: [],
    /**
       * 初始化函数
       * @param {Object} user - 初始化用户信息 包括userCode\userName
       * @param {Function} success - 初始化成功之后的回掉
       * @param {Function} fail - 初始化失败之后的回掉
    */
    init: function (user, options, success, fail) {
        this.webim = window.webim
        this.user = user
        this.getSig(user, success, fail)
        this.MemberList = options.MemberList
    },
    /**
     * 从服务端获取签名验证
     * 参数同上  
     */
    getSig: function (user, success, fail) {
        httpApi.Get(
            {url: 'webrtc/weapp/webrtc_room/get_login_info2', 
            data: {
              userID: this.user.userCode
            }})
            .then(res=>{
                this.user = Object.assign(this.user, res.data)
                this.login(res.data, success, fail)
            })
    },
    /**
     * 执行webim登陆 并添加监听事件
     * @param {Object} res - 服务端返回的签名信息
     * @param {Function} success - 登陆成功之后的回掉
     * @param {Function} fail - 登陆失败之后的回掉
     */
    login: function (res, success, fail) {
        let self = this
        this.webim.login({
            sdkAppID: res.sdkAppID,
            appIDAt3rd: res.sdkAppID,
            identifier: self.user.userCode,
            identifierNick: self.user.userName || '213',
            accountType: res.accType,
            userSig: res.userSig},{ //  listeners
                onBigGroupMsgNotify: self.onBigGroupMsgNotify,
                onConnNotify: self.onConnNotify,
                onMsgNotify: self.onMsgNotify
            }, { //  options
                isAccessFormalEnv: self.isAccessFormalEnv,
                isLogOn: self.isLogOn
            },
            function (resp) {
                // loginInfo.identifierNick = resp.identifierNick;//设置当前用户昵称
                console.log('webim.login成功', resp)
                success && success()
            },
            function (err) {
                console.log('webim.login失败', err.ErrorInfo)
                fail && fail(err)
            }
        )
    },
    /**
     * 创建直播大群
     * @param {Object} options - 初始化用户信息 roomNumber(房间号|Number)\userCode(用户id|Number)\name(用户名称|String)
     * @param {Function} succCallback - 初始化成功之后的回掉
     * @param {Function} failCallback - 初始化失败之后的回掉
     */
    createBigGroup: function(options, succCallback,failCallback){
      let _this = this
      console.log(options)
      this.webim.createGroup(
            {
                'GroupId': options.roomNumber,
                'Owner_Account': options.userCode || _this.user.userCode,
                'Type': 'Public', // 设置群类型为音视频群
                'Name': options.name, // 群名称
                'MemberList': JSON.parse(JSON.stringify(this.MemberList)),
                "ApplyJoinOption": "FreeAccess"  // 申请加群处理方式（选填）
            },
            function (resp) {
              // console.info('create group succ, groupId:', groupId);
              _this.applyJoinBigGroup(options.roomNumber)
              succCallback && succCallback(resp);
            },
            function (err) {
              console.error('groupgroupgroupgroupgroup', err);
              if(err.ErrorCode == '10025' || err.ErrorCode == '10021'){
                _this.applyJoinBigGroup(options.roomNumber)
              }
              failCallback && failCallback(err);
            }
          );
    },
    /**
     * 加入直播大群
     * @param {Number} groupId - 房间号
     */
    applyJoinBigGroup: function(groupId) {
        let that = this;
        var options = {
          'GroupId': groupId//群id
        };
        webim.applyJoinBigGroup({
            'GroupId': groupId//群id
        },
          function (resp) {
              // JoinedSuccess:加入成功; WaitAdminApproval:等待管理员审批
            if (resp.JoinedStatus && resp.JoinedStatus == 'JoinedSuccess') {
              console.info('进群成功');
            } else {
              console.error('进群失败');
            }
          },
          function (err) {
            console.info('join group fail', err);
            if(err.ErrorCode == 10013){
              that.changeSendUser({sendToId: groupId})
              // that.applyJoinBigGroup(groupId)
            }
          }
        );
      },
      /**
       * 发送消息
       * @param {Object} message - 发送的消息 必填
       * @param {String} ext - custom类型消息的扩展字段
       * @param {Function} success - 发送成功回调
       * @param {Function} fail - 发送失败回调
       */
      sendMsg: function (message, ext = '', success, fail) {
          let self = this
          console.log('我进来了')
        if (_.isEmpty(message.content)) {
            return
          }
      if(!self.sendToId){
        // iView.Message.warning('请选择左侧患者')
        return;
      }
      console.info('发送到：', self.sendToId + ':' + self.sendToName)
      var selSess = new self.webim.Session(self.webim.SESSION_TYPE.GROUP, self.sendToId);
      var isSend = true;//是否为自己发送
      var seq = -1;//消息序列，-1表示sdk自动生成，用于去重
      var random = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
      var msgTime = Math.round(new Date().getTime() / 1000);//消息时间戳
      var subType = self.webim.GROUP_MSG_SUB_TYPE.COMMON;//消息子类型
      console.log('loginInfo:', self.infos);
      var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, self.user.userCode, subType, self.user.userName);
      switch (message.type) {
        case 'text': {
          //解析文本和表情
          var expr = /\[[^[\]]{1,3}\]/mg;
          var emotions = message.content.match(expr);
          var text_obj, face_obj, tmsg, emotionIndex, emotion, restMsgIndex;
          if (!emotions || emotions.length < 1) {
            text_obj = new webim.Msg.Elem.Text(message.content);
            msg.addText(text_obj);
          } else { // 有表情
            for (var i = 0; i < emotions.length; i++) {
              tmsg = message.content.substring(0, message.content.indexOf(emotions[i]));
              if (tmsg) {
                text_obj = new webim.Msg.Elem.Text(tmsg);
                msg.addText(text_obj);
              }
              emotionIndex = webim.EmotionDataIndexs[emotions[i]];
              emotion = webim.Emotions[emotionIndex];
              if (emotion) {
                face_obj = new webim.Msg.Elem.Face(emotionIndex, emotions[i]);
                msg.addFace(face_obj);
              } else {
                text_obj = new webim.Msg.Elem.Text(emotions[i]);
                msg.addText(text_obj);
              }
              restMsgIndex = message.content.indexOf(emotions[i]) + emotions[i].length;
              message.content = message.content.substring(restMsgIndex);
            }
            if (message.content) {
              text_obj = new webim.Msg.Elem.Text(message.content);
              msg.addText(text_obj);
            }
          }
        }
          break;
        case 'image': {
          // var image_obj = new webim.Msg.Elem.Images.Image(message.content);
          // var msgContent = new webim.Msg.Elem.Images(
          //   "", //msgBody.MsgContent.UUID,
          //   "", //msgBody.MsgContent.ImageFormat || ""
          // );
          // console.log('msgContent:', message.content);
          // msgContent.addImage(
          //   new webim.Msg.Elem.Images.Image(
          //     1,//tempImg.Type,
          //     0,//tempImg.Size,
          //     0,//tempImg.Width,
          //     0,//tempImg.Height,
          //     message.content
          //   )
          // );
          // msg.elems.push(new webim.Msg.Elem(webim.MSG_ELEMENT_TYPE.IMAGE, msgContent));
          var msgContent = new webim.Msg.Elem.Custom(
            'image',
            JSON.stringify(message.content),
            JSON.stringify(ext)
          );
          msg.elems.push(new webim.Msg.Elem(webim.MSG_ELEMENT_TYPE.CUSTOM, msgContent));
        }
          break;
        case 'custom': {
          msgContent = new webim.Msg.Elem.Custom(
            message.content,
            "",
            ext
          );
          msg.elems.push(new webim.Msg.Elem(webim.MSG_ELEMENT_TYPE.CUSTOM, msgContent));
        }
          break;
      }
          console.log('message', msg)
          this.webim.sendMsg(
            msg,
            () => {
                success && success()
              console.log(':) 发送了消息: ' + message.content)
            },
            error => {
                //  因为长时间不懂导致的70221失败 在初始化后重新发送消息
                if (error.ErrorCode == '70221' || error.ErrorCode == '-4'){
                    self.init(self.user, () => self.sendMsg(message, ext, success, fail))
                }
                fail && fail(error)
                console.log(':( 发送消息失败', error)
            }
          )
      },
    /**
     * 退出直播大群
     * @param {Number} groupId - 房间号
     */
      quitBigGroup: function(GroupId, callback){
        let self = this
        this.webim.quitBigGroup({
                'GroupId': GroupId//群id
            },
            function (resp) {
                self.sendToId = null
                console.log('退群成功');
                callback && callback()
            },
            function (err) {
                console.log('err.ErrorInfo', err.ErrorInfo);
                //  todo 退出失败有可能是房间已经解散，待错误发生时加入判断code码
                if(err.ErrorCode != 10009){
                  self.sendToId = null
                  callback && callback()                  
                }
            });
      },
      //  退出登录
      logout: function (callback) {
          let self = this
        this.webim.logout(
            function (resp) {
                self.webim.Log.info('登出成功');
                self.user = null
                self.sendToId = null
                callback && callback()
            },
            function (err) {
                console.log('err.ErrorInfo',err.ErrorInfo);
                // if(err.ErrorCode == 70221){
                //   self.getSig({}, self.logout)
                // }
                callback && callback()
            }
        );
      },
      /**
     * 更换聊天对象
     * @param {Object} user - 聊天对象
     */
      changeSendUser(user){
        console.log('this.sendToId', this.sendToId)
        if(this.sendToId){
          this.quitBigGroup(this.sendToId, ()=>{
            this.initGroup(user)
          })
        } else this.initGroup(user)
        
      },
      //  同上函数
      initGroup(user){
        console.log('加入房间', user)
        this.sendToId = user.sendToId
        console.log('加入房间', this)
        this.sendToName = user.name
        this.createBigGroup({
          roomNumber: user.sendToId,
          userCode: this.user.userCode,
          name: this.user.name || '213',
          MemberList: this.MemberList
        })
      },
    /**
     * listeners
     */
    onMsgNotify: function (messages) {
      console.log('onMsgNotify', messages)
      if (!(messages && messages.length > 0)) return
      let self = IM
      console.log('messages', self.sendToId)
      const sessions = {}
      messages.forEach(msg => {
        console.log('收到消息：', msg.getSession())
        let content = ''
        let type = ''
        console.log('getType()', msg.getSession().id(), self.sendToId)
        if (msg.getSession().id() != self.sendToId) return;
        msg.getElems().forEach(element => {
          console.log('getType()', element.getType())
          if (element.getType() === webim.MSG_ELEMENT_TYPE.GROUP_TIP) { // 群组提示消息
            // console.log(element.getContent().getOpType())
          } else if (element.getType() === webim.MSG_ELEMENT_TYPE.CUSTOM) { // 自定义消息
            console.log('element.getContent().getData()', element.getContent())
            if (_.startsWith(element.getContent().getData(), 'yisheng:')) {
              //  音视频请求
              // dispatch('startWebRTCRequest', param.visitCode)
            } else if (_.startsWith(element.getContent().getData(), 'chufang:')) {
              content = element.getContent().getData().split(':')[1]
              type = 'chufang'
            } else if (_.startsWith(element.getContent().getData(), 'msgprescrip:')) {
              content = '医生正在为您开处方，请稍后！'
              type = 'text'
            } else if (_.startsWith(element.getContent().getData(), 'msgcase:')) {
              content = '医生正在为您写病历，请稍后！'
              type = 'text'
            } else if (_.startsWith(element.getContent().getData(), 'bingli:')) {
              content = 'bingli'
              type = 'bingli'
            } else if (_.startsWith(element.getContent().getData(), 'msginspect:')) {
              content = '医生正在为您开检查检验，请稍后！'
              type = 'text'
            } else if (_.startsWith(element.getContent().getData(), 'REJECT')) {
              content = '您已拒绝医生的视频请求！'
              type = 'text'
            } else if (_.startsWith(element.getContent().getData(), 'CANCEL_VIDEO')) {
                  //  挂断视频消息类型
              dispatch('endWebRTCRequest', param.visitCode)
              content = msg.getIsSend() ? '您取消了视频通话!' : '医生取消了视频通话!'
              type = 'text'
              console.log(consulting.methods)
              consulting.methods.hangUp(()=>{
                console.log('执行回调函数')
                store.commit('chatStore/updateDisplayStar', true)
                store.commit('chatStore/updateWebRTCAvailable', true)
              })
            } else if (_.startsWith(element.getContent().getData(), 'jiancha:')) {
              content = element.getContent().getData().split(':')[1]
              type = 'jiancha'
            } else if (_.startsWith(element.getContent().getData(), 'image')) {
              content = JSON.parse(element.getContent().getDesc())
              type = 'image'
            }
          } else if (element.getType() === webim.MSG_ELEMENT_TYPE.TEXT) { // 文本消息
            content = element.getContent().getText()
            type = 'text'
          } else if (element.getType() === webim.MSG_ELEMENT_TYPE.IMAGE) { // 图片消息
            content = element.getContent().getImage(1).getUrl()
            console.log(element.getContent().getImage(1).getUrl())
            type = 'image'
          } else if (element.getType() === webim.MSG_ELEMENT_TYPE.FILE) { // 文件消息
            console.log(element.getContent(), 'element.getContent()')
            content = element.getContent().uuid.split(';;')[0]
            type = 'file'
          }
        })
        console.log('content', msg.getTime())
        if (!_.isEmpty(content)) {
          console.log({
            content,
            isSend: msg.getIsSend(),
            type
          }, 'jdsfhifhdhdfjhdkjfhsdkjfhsjdfhkdjhfkjsdhk')
          console.log(store)
          store.commit('addMessage', {
            content,
            isSend: msg.getIsSend(),
            type,
            time: msg.getTime(),
            uniqueId: msg.uniqueId
          })
        }
        sessions[msg.getSession().id()] = msg.getSession()
      })
      Object.keys(sessions).forEach(key => { // 将会话标记为已读
          console.log('sessions[key]', sessions[key])
        webim.setAutoRead(sessions[key], true, true)
      })
    },
    onBigGroupMsgNotify: function (messages) {
      if (!(messages && messages.length > 0)) return
        let self = IM
        console.log('messages', self.sendToId)
        const sessions = {}
        messages.forEach(msg => {
          console.log('收到消息：', msg.getSession())
          let content = ''
          let type = ''
          console.log('getType()', msg.getSession().id(), self.sendToId)
          if (msg.getSession().id() != self.sendToId) return;
          msg.getElems().forEach(element => {
            console.log('getType()', element.getType())
            if (element.getType() === webim.MSG_ELEMENT_TYPE.GROUP_TIP) { // 群组提示消息
              // console.log(element.getContent().getOpType())
            } else if (element.getType() === webim.MSG_ELEMENT_TYPE.CUSTOM) { // 自定义消息
              console.log('element.getContent().getData()', element.getContent())
              if (_.startsWith(element.getContent().getData(), 'yisheng:')) {
                //  音视频请求
                // dispatch('startWebRTCRequest', param.visitCode)
              } else if (_.startsWith(element.getContent().getData(), 'chufang:')) {
                content = element.getContent().getData().split(':')[1]
                type = 'chufang'
              } else if (_.startsWith(element.getContent().getData(), 'msgprescrip:')) {
                content = '医生正在为您开处方，请稍后！'
                type = 'text'
              } else if (_.startsWith(element.getContent().getData(), 'msgcase:')) {
                content = '医生正在为您写病历，请稍后！'
                type = 'text'
              } else if (_.startsWith(element.getContent().getData(), 'bingli:')) {
                content = 'bingli'
                type = 'bingli'
              } else if (_.startsWith(element.getContent().getData(), 'msginspect:')) {
                content = '医生正在为您开检查检验，请稍后！'
                type = 'text'
              } else if (_.startsWith(element.getContent().getData(), 'REJECT')) {
                content = '您已拒绝医生的视频请求！'
                type = 'text'
              } else if (_.startsWith(element.getContent().getData(), 'CANCEL_VIDEO')) {
                    //  挂断视频消息类型
                dispatch('endWebRTCRequest', param.visitCode)
                content = msg.getIsSend() ? '您取消了视频通话!' : '医生取消了视频通话!'
                type = 'text'
                console.log(consulting.methods)
                consulting.methods.hangUp(()=>{
                  console.log('执行回调函数')
                  store.commit('chatStore/updateDisplayStar', true)
                  store.commit('chatStore/updateWebRTCAvailable', true)
                })
              } else if (_.startsWith(element.getContent().getData(), 'jiancha:')) {
                content = element.getContent().getData().split(':')[1]
                type = 'jiancha'
              } else if (_.startsWith(element.getContent().getData(), 'image')) {
                content = JSON.parse(element.getContent().getDesc())
                type = 'image'
              }
            } else if (element.getType() === webim.MSG_ELEMENT_TYPE.TEXT) { // 文本消息
              content = element.getContent().getText()
              type = 'text'
            } else if (element.getType() === webim.MSG_ELEMENT_TYPE.IMAGE) { // 图片消息
              content = element.getContent().getImage(1).getUrl()
              console.log(element.getContent().getImage(1).getUrl())
              type = 'image'
            } else if (element.getType() === webim.MSG_ELEMENT_TYPE.FILE) { // 文件消息
              console.log(element.getContent(), 'element.getContent()')
              content = element.getContent().uuid.split(';;')[0]
              type = 'file'
            }
          })
          console.log('content', msg.getTime())
          if (!_.isEmpty(content)) {
            console.log({
              content,
              isSend: msg.getIsSend(),
              type
            }, 'jdsfhifhdhdfjhdkjfhsdkjfhsjdfhkdjhfkjsdhk')
            console.log(store)
            store.commit('addMessage', {
              content,
              isSend: msg.getIsSend(),
              type,
              time: msg.getTime(),
              uniqueId: msg.uniqueId
            })
          }
          sessions[msg.getSession().id()] = msg.getSession()
        })
        Object.keys(sessions).forEach(key => { // 将会话标记为已读
            console.log('sessions[key]', sessions[key])
          webim.setAutoRead(sessions[key], true, true)
        })
      },
      /**
       * 设置群组会话自动已读
       * @param {Object} selSess - 会话对象，必须为webim.Session的实例。
       * @param {boolean} isOn - 是否上报当前会话已读消息，同时将selSess的自动已读消息标志改为isOn
       * @param {boolean} isResetAll - 是否重置所有会话的自动已读标志
       */
      setGroupAutoRead: function (selSess, isOn, isResetAll) {
        this.webim.setAutoRead(sessions[key], true, true)
      },
      onConnNotify: function(resp){
        // console.log('resp', resp)
        let _this = IM
        var info;
        switch (resp.ErrorCode) {//链接状态码
          case webim.CONNECTION_STATUS.ON: {
            webim.Log.warn('建立连接成功: ' + resp.ErrorInfo);
          }
            break;
          case webim.CONNECTION_STATUS.OFF:
            info = '连接已断开，无法收到新消息，请检查下您的网络是否正常: ' + resp.ErrorInfo;
            // alert(info);
            MessageBox({
              title: '温馨提示',
              message: info,
              confirmButtonText: '确定',
            })
            .then(()=> {
              window.history.go(-1)
              // _this.init(_this.user)
            })
            break;
          case webim.CONNECTION_STATUS.RECONNECT:
            info = '连接状态恢复正常: ' + resp.ErrorInfo;
            // alert(info);
            webim.Log.warn(info);
            break;
          default:
            webim.Log.error('未知连接状态: =' + resp.ErrorInfo); //错误信息
            break;
        }
      },
      // ------------------------ RTC -------------------------------
}


// export default {
//     install: (Vue) => {
//         Vue.prototype.$IM = IM
//     }
// }
export default IM