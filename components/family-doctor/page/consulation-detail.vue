<template>
    <div class="chat-box">
        <div class="head-tips">
            <h6>{{currentVisit.doctorName || '大象医生'}}</h6>
            <div>
                <span>{{currentVisit.deptName}} {{currentVisit.doctorTitleName}}</span>
                <!-- <span v-if="currentVisit.visitStatus == 110">剩余时间: <i>{{currentVisit.countDown | countUpData}}</i></span> -->
                <!-- <span v-if="currentVisit.visitStatus == 110"><i>问诊中</i></span> -->
                <i v-if="currentVisit.visitStatus != 110">{{currentVisit.visitStatus == 200 ? '已结束': currentVisit.visitStatus == 100 ? '待接诊' : ''}}</i>
            </div>
        </div>
        <div class="chat-history-com" ref="chatHistoryCom" >
            <chat-history></chat-history>
        </div>
        
        <div class="control" v-if="currentVisit.visitStatus == 110 || currentVisit.visitStatus == 100">
            <textarea class="send-text" ref="sendText" 
            @cut="resizeHeight"
            @change="resizeHeight"
            @paste="resizeHeight"
            @drop="resizeHeight"
            @keydown="resizeHeight"
            @keyup.enter="submitMsg"
            type="text" v-model="message" placeholder="请输入文字内容"></textarea>
            <!-- <input class="send-text" ref="sendText" type="text" v-model="message" placeholder="请输入文字内容" maxlength="100"> -->
            <img @click="uploadFile" src="../../../assets/images/icon_img.png" alt="">
            <img @click="submitMsg" src="../../../assets/images/icon_send.png" alt="">
            <input ref="uploadFile" @change="getFile" v-show="false" type="file" name="image" accept="image/*">
        </div>
        <!-- 注释评价 -->
        <!-- <div class="control" v-else>
           <div class="evaluate-box">
               <div class="evaluate-grade">
                   <span v-for="(v) in 5" :class="v <= evaluateGrade ? 'avtive' : ''" :key="v" @click="(!currentVisit.score || currentVisit.score == null) ? setUpGrade(v) : ''"><img src="../../../assets/images/icon_star4.png" alt=""></span>
                   <i v-if="evaluateGrade > 0">{{evaluateGrade}}星满意</i>
               </div>
               <span class="evaluate-btn" v-if="(!currentVisit.score || currentVisit.score == null)" @click="saveVisitServiceEvaluate">评价</span>
               <div class="evaluate-end" v-else>
                   <img src="../../../assets/images/icon_tick.png" alt="">
                   <span>已评价</span>
               </div>
           </div>
        </div> -->
    </div>
</template>
<script>
// import { InfiniteScroll } from 'vant';
import IM from '../../../utils/js/imRTC.js'
import { mapState, mapMutations } from 'vuex';
import { countUpData, formatUnixT, isJSON, getGroupIdByCode } from '../js/index'
import { uploadFile, getVisitStatusById, saveVisitServiceEvaluate } from '@/utils/api/familyDoctor'
import ChatHistory from '../components/chat-history'
import conversation from '../js/conversation'
// import { Toast  } from 'vant';
export default {
    name: 'ConsultationDetail',
    components: {
        // InfiniteScroll,
        ChatHistory
    },
    filters: { countUpData },
    extends: conversation,
    data: function (){
        return {
            loading: false,
            message: '',
            evaluateGrade: 0, //  评价得分
            remainTime: 0, // 问诊剩余时间
            t: null,
            getVisitStatusByIdT: null, // setInterval
        }
    },
    mounted: function () {
        let _this = this
        this.getVisitStatusById(()=>{
            if(this.isLogin && this.isSDKReady) this.checkoutConversation2() // this.searchGroupByID(this.currentVisit.groupID)
            // 处理异常登录后重新加入房间
            this.onchange = function(e){
                if(e && this.isSDKReady && this.isLogin) this.checkoutConversation2() // this.searchGroupByID(this.currentVisit.groupID)
            }
        })
        this.getVisitStatusByIdT = setInterval(()=>{
            // 传入true  代表不是第一次加载 不去初始化im
                this.getVisitStatusById()
            }, 10000)
    },
   
    methods: {
        ...mapMutations(['setCurrentVisit', 'clearUnRead']),
        onchange(data){
        },
        submitMsg(){
            this.sendMsg(this.message)
            this.message = ''
            this.resizeHeight()
        },
        //  滚到底部
        scrollBottom(){
            console.log('scrollBottom')
            this.$nextTick(()=>{
                var ele = this.$refs.chatHistoryCom
                ele.scrollTop = ele.scrollHeight
            })
        },
        // 评价分数change
        setUpGrade (grade) {
            this.evaluateGrade = grade
        },
        //  提交评价
        saveVisitServiceEvaluate(){
            saveVisitServiceEvaluate({
                doctorCode: this.currentVisit.doctorCode,
                score: this.evaluateGrade,
                typeCode: this.currentVisit.typeCode,
                userCode: this.currentVisit.userCode,
                visitCode: this.currentVisit.code
            })
            .then(res => {
                Toast({
                    message: '评价成功'
                })
                this.getVisitStatusById()
                console.log('评价成功')
            })
        },
        //  上传图片
        uploadFile () {
            this.$refs.uploadFile.click()
        },
        //  发送图片消息
        getFile () {
            console.log('111', this.$refs.uploadFile.files)
            let _this = this
            var formData = new FormData();
            formData.append("code", _this.currentVisit.userCode);
            formData.append("modularType", 'DPC');
            formData.append("file", this.$refs.uploadFile.files[0]);
            uploadFile(formData)
            .then(res => {
                console.log('res', res.data.filePath)
                this.$refs.uploadFile.value = ''
                _this.createImageMessage(res.data.filePath)
            })
        },
        //  获取问诊信息
        getVisitStatusById (callback) {
            getVisitStatusById({id: this.$route.query.id})
            .then(res=>{
                console.log(res)
                if(res.data.code == 0){
                    let visitRecord = res.data.data || {}
                    // this.remainTime = res.data.data.remainTime || 50000
                    visitRecord.groupID = getGroupIdByCode(visitRecord.code)
                    this.evaluateGrade = visitRecord.score || 0
                    this.setCurrentVisit(visitRecord)
                    // this.startCountDown()
                    if(visitRecord.visitStatus == 200){
                        this.getListByQueueCode()
                        return;
                    }
                    callback && callback()
                }
            })
        },
        // 开始倒计时
        startCountDown(time){
            console.log('开始')
            if(this.t){
                clearInterval(this.t)
            }
            if(this.currentVisit.countDown >= 0){
                this.t = setTimeout(()=>{
                    this.currentVisit.countDown-=1000
                    this.startCountDown()
                }, 1000)
            } else {
                this.currentVisit.countDown = 0
                // todo 后端支持倒计时结束后订单结束时打开此行
                // this.currentVisit.visitStatus = 200
                
            }
        },
        // 动态修改textarea高度
        resizeHeight () {
            setTimeout(()=>{
                this.$refs.sendText.style.height = 30 / (750/window.innerWidth) + 'px';
                this.$refs.sendText.style.height = this.$refs.sendText.scrollHeight + 'px'
            }, 0)
        }
    },
    computed: {
        ...mapState({
            currentVisit: state => state.conversation.currentVisit,
            isSDKReady: state => state.chatStore.isSDKReady,
        })
    },
    destroyed: function(){
        if(this.t){
            clearTimeout(this.t)
        }
        if(this.getVisitStatusByIdT){
            clearInterval(this.getVisitStatusByIdT)
            this.getVisitStatusByIdT = null
        }
    }
}
</script>
<style lang="scss" scoped>
@import "./consulation-detail.scss";
</style>


