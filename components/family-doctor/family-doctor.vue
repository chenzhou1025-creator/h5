<template>
  <div class="container-box">
    <tabs v-model="active" @change="tabClick" line-width="22" color="#1C96DD" title-active-color="#1C96DD">
      <tab v-for="(v, i) in tabList" :title="v.name" :key="i" :name="v.route"></tab>
    </tabs>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" style='height: calc(100vh - 50px)'></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
<script>
import { Tab, Tabs } from 'vant';
export default {
  name: 'family-doctor',
  components: { Tab, Tabs },
  data () {
    return {
      tabList:[{name: '我的医生', route: '/familyDoctor/myDoctor'}, {name: '我的咨询', route: '/familyDoctor/consultation'}],
      active:'',
    }
  },
  created() {
      this.active = this.$route.path;
  },
  methods:{
    tabClick(route){
      console.log(route)
      this.active = route
      this.$router.replace({path:route})
    }
  },
   mounted() {
    this.active = this.$router.history.current.fullPath;
  }
} 
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "./family-doctor.scss";
</style>
