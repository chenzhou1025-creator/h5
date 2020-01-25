<template>
<div class="container">
   <router-view  />
  <!--<audio :src="audioSrc"  ref="audio" autoplay style="display: none"></audio>-->
</div>

</template>
<script>

import Vue from 'vue'
import {webSocketServer} from '@/utils/js/env.js';
import { mapState, mapActions, mapMutations } from "vuex";
import { loginUrl } from '@/utils/api/commonApi.js'
export default {
  name: 'Index',
  components:{
  },
  data () {
    return {
    }
  },
  created:function(){
    this.hideShare()
    this.getCardNo()
  },
  computed: {
    ...mapState({
    })
  },
  methods: {
    ...mapMutations(['updatecardNo']),
    ...mapActions(['getTimSign']),
    hideShare(){
            document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
        // 通过下面这个API隐藏右上角按钮
        WeixinJSBridge.call('hideOptionMenu');
      });
    },
    getCardNo(){
        console.log(this.$route.query.cardNo)
        let sessionCard = this.$route.query.cardNo
        let orderNum = this.$route.query.orderNum
        // let sessionCard = this.$router.history.current.query.cardNo
        if(sessionCard){
          // cardNo = encodeURIComponent(cardNo)
          // sessionStorage.removeItem('cardNo');
          sessionStorage.setItem('decodeCardNo', sessionCard)
          sessionStorage.setItem('orderNum', orderNum)
          this.initLogin(sessionCard, orderNum)
        } else {
          if(sessionStorage.getItem('mobile')){
            this.getTimSign({userID: JSON.parse(sessionStorage.getItem('mobile'))})
          }
        }
    },
    initLogin(sessionCard, orderNum){
      this.$Http.Get({
                url: loginUrl,
                data:{
                     cardNo: sessionCard,
                     orderNum: orderNum
                }
            })
            .then(res => {
              sessionStorage.setItem('mobile', res.data.userInfo.mobile)
              sessionStorage.setItem('cardNo', res.data.cardNo)
              sessionStorage.setItem('orderNum', res.data.orderNum)
              this.getTimSign({userID: res.data.userInfo.mobile})
              this.updatecardNo(this.getRandom8())
            })
    },
    getRandom8(){
      return Math.floor(Math.random()* 100000000)
    }
  }
} 
</script>

