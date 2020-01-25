<template>
  <div>
    <!-- <div @click="goDetail('show')">我的医生-内页显示tab</div> -->
    <!-- <div @click="goDetail()">我的医生-不显示头，底</div> -->
    <!-- 已绑定家庭医生 -->
    
    <div class="bind-doctor" v-if="isBind">
      <doctor-detail-com style="padding: 0 12px;" :doctor='doctor'>
        <div class="bind-doctor-btn" slot="control">
          <span @click="changeBind">更换绑定</span>
          <span @click="startVisit">立即咨询</span>
        </div>
      </doctor-detail-com>
    </div>
    
    <div v-if='doctorArr.length==0'>
      <noFound text='暂无医生记录'></noFound>
    </div>
    <!-- 未绑定家庭医生 -->
    <div class="unbind-doctor" v-if="!isBind && doctorArr.length>0">
      <h6 class="tip">选择绑定自己的家庭医生后开始咨询</h6>
      <div class="unbind-doctor-scroll" ref="unbindDoctor">
        <pull-refresh  v-model="loading" @refresh="loadTop">
          <list
          v-model="loading"
          :finished="isLoaded"
          finished-text="已加载全部数据"
          @load="loadBottom"
        >
          <div class="unbind-doctor-item" v-for="(v, i) in doctorArr" :key="i"  @click="v.dxDoctorCodeBinding != 'binding' ? goToDoctorDetail(v): gotoBindDoctorDetail(v)">
              <div class="doctor-headImg">
                <img src="../../../assets/images/icon_doctor.png" alt="">
              </div>
              <ul>
                <li>
                    <span>{{v.doctorName || '大象医生'}}</span>
                    <span>{{v.deptName}}</span>
                    <span>{{v.doctorTitleName}}</span> 
                  </li>
                  <li>
                      <span>{{v.orgName || '大象医生指定医院'}}</span> 
                  </li>
                  <li>
                    <div>
                        <img v-for="v in Math.round((v.evaluationScore || 100)/20)" :key="v" src="../../../assets/images/icon_star3.png" alt="">
                        <span>{{v.evaluationScore || 100}}%</span>
                    </div>
                    <span>服务人次: {{v.serviceCount || 0}}</span>
                  </li>
                </ul>
                <div class="bind-btn" v-show="v.dxDoctorCodeBinding != 'binding'">
                  <span @click.stop="bindDoctor(v)">绑定</span>
                </div>
            </div>
          </list>
        </pull-refresh>
      </div>      
    </div>
  </div>
</template>
<script>
    import noFound from '@/components/common/no-found/no-found'
    import DoctorDetailCom from "../components/doctor-detail-com";
    import { mapState, mapActions, mapMutations } from "vuex";
    import { myDoctors, changeAndBind, startVisit } from '../../../utils/api/familyDoctor';
    import { List, PullRefresh } from 'vant'
    export default {
        name: "myDoctor",
        components: {
            DoctorDetailCom,
            noFound,
            List,
            PullRefresh
        },
        data() {
            return {
                burStyle: "",
                isBind: false, // 是否已绑定家庭医生
                loading: false, // 是否处于加载中
                isLoaded: true, // 是否加载完毕 
                pageNum: 1,
                doctorArr: [],
                doctor: {},
                pos: 0,
                activeInitFlag: false
            };
        },
        created: function(){
          console.log('created')
        },
        computed: {
            ...mapState({
                cardNohasUpdated: state => state.commonStore.cardNohasUpdated
            })
        },
        watch: {
          cardNohasUpdated(newV, oldV){
              if(newV){
                this.myDoctors((data)=>{
                  this.doctorArr[0].dxDoctorCodeBinding == 'binding' ? this.gotoBindDoctorDetail(this.doctorArr[0]) : this.isBind = false
                });
              }
          }
        },
        mounted: function(){
          this.createInit()
        },
        activated: function () {
          let _this = this
          //  处理返回时 缓存初始化 暂时不用
          // if(this.activeInitFlag) {
          //   this.createInit()
          // }
          // this.activeInitFlag = true
           if(this.pos > 0){
             _this.$refs.unbindDoctor.scrollTop = _this.pos
             _this.pos = 0
           }
           this.$refs.unbindDoctor && this.$refs.unbindDoctor.addEventListener('scroll', function(){
             _this.pos = _this.$refs.unbindDoctor.scrollTop || 0
           }, false)
        },
        methods: {
          init () {
            this.pos = 0;
            this.doctorArr = [];
            this.pageNum = 1;
            this.isLoaded = false;
          },
          createInit () {
            this.init();
            // this.activeInitFlag = false
          // 页面初始化请求时 需判断患者是否已绑定家庭医生 
            if(this.cardNohasUpdated){
              this.myDoctors(()=>{
                this.doctorArr[0].dxDoctorCodeBinding == 'binding' ? this.gotoBindDoctorDetail(this.doctorArr[0]) : this.isBind = false
              });
            }
          },
          //  下拉刷新
          loadTop() {
            this.init();
            this.myDoctors()
            
          },
          // 上啦加载
          loadBottom() {
            if(!this.isLoaded){
              this.pageNum++
              this.myDoctors(()=>this.$refs.loadmore.onBottomLoaded())
            } 
          },
          //  获取医生列表
          myDoctors (callback) {
            myDoctors({cardNo: sessionStorage.getItem('cardNo'), pageNum: this.pageNum})
            .then(res => {
              this.loading = false
              console.log('myDoctors', res)
              if(res.data.code == 0){
                if(this.pageNum == 1) this.doctorArr =[]
                this.doctorArr = this.doctorArr.concat(res.data.data)
                this.isLoaded = this.doctorArr.length < res.data.total ? false : true
                callback && callback(res.data.data)
              }
            })
          },
          //  查看未绑定医生详情
          goToDoctorDetail(v){
            this.$router.push({path: '/familyDoctor/myDoctorDetail', query: {doctorCode: v.doctorCode}})
          },
          //  查看已绑定医生详情 不跳转页面
          gotoBindDoctorDetail(v){
            this.doctor = v
            this.isBind = true
          },
          //  绑定
          bindDoctor(v){
            let _this = this
            this.$dialog.confirm({
                              title: '温馨提示',
                              message: '确定绑定' + (v.doctorName || '大象') + '医生为你的家庭医生吗?'
                          }).then(() => {
                            _this.changeAndBind(v)
                          }).catch(() => {});
          },
          //  绑定接口
          changeAndBind(v){
            let _this = this
            changeAndBind({cardNo: sessionStorage.getItem('cardNo'), doctorCode: v.doctorCode})
            .then(res=>{
              if(res.data.code == 0){
                _this.doctor = v
                _this.isBind = true
              } else {
                //  绑定失败
              }
            })
          },
          //  更换绑定
          changeBind(){
            this.isBind = false
            this.loadTop()
          },
          //  立即咨询
          startVisit(){
            startVisit({cardNo: sessionStorage.getItem('cardNo'), doctorCode: this.doctor.doctorCode, orderNum: sessionStorage.getItem('orderNum')})
            .then(res => {
              this.$router.push({path: '/familyDoctor/consultationDetail', query:{
                code: res.data.queueCode,
                id: res.data.visitId
              }})
            })
          }
        },
        deactivated: function(){
          this.$refs.unbindDoctor && this.$refs.unbindDoctor.removeEventListener('scroll', null)
        }
    };
</script>
<style lang="scss" scoped>
    @import "./my-doctor.scss";
</style>