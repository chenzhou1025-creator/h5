<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";

export default {
  name: 'App',
  data () {
    return { 
      lastTime: null, //最后一次点击的时间
      currentTime: null, //当前点击的时间
      timeOut: 240 * 60 * 1000 //设置超时时间： 4小时
    }
  },
  created() {            
    this.lastTime = new Date().getTime();   //网页第一次打开时，记录当前时间
    this.reset()
    setTimeout(()=>this.initListener())
    // if(sessionStorage.getItem('mobile')){
    //   console.log()
    //   this.getTimSign({userID: JSON.parse(sessionStorage.getItem('mobile'))})
    // }
  },
  methods:{
    ...mapActions(['getTimSign', 'initListener']),
    ...mapMutations(['reset']),
    // isDo() {
    //     this.currentTime = new Date().getTime(); //记录这次点击的时间
    //     console.log('当前是否超时：',this.currentTime - this.lastTime > this.timeOut)
    //     if(this.currentTime - this.lastTime > this.timeOut && sessionStorage.isLogin) {  //判断上次最后一次点击的时间和这次点击的时间间隔是否大于4小时
    //         // 这里写状态已过期后执行的操作
    //         const content = '<p> 由于你长时间未操作,登录超时,请重新登录。</p>';
    //         this.$Modal.warning({
    //             title: '消息提醒',
    //             content: content
    //         });
    //         this.$router.push("/login");
    //     } else {
    //         this.lastTime = new Date().getTime(); //如果在4小时内点击，则把这次点击的时间记录覆盖掉之前存的最后一次点击的时间
    //     }
    // }

  }
}
</script>


