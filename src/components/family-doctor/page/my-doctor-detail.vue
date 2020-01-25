
<template>
  <div>
    <div>
      <doctor-detail-com style="padding: 0 12px;" :doctor=doctor>
        <div class="bind-doctor-btn" slot="control">
          <span @click="bindDoctor">绑定并开始咨询</span>
        </div>
      </doctor-detail-com>
    </div>
  </div>
</template>

<script>
import DoctorDetailCom from "../components/doctor-detail-com";
import { doctorDetail, changeAndBind, startVisit } from '../../../utils/api/familyDoctor'
export default {
  name: "ConsultationDetail",
  components: { DoctorDetailCom },
  data() {
    return {
      doctor: {}
    };
  },
  mounted: function() {
    this.doctorDetail()
  },
  methods: {
    //  获取医生详情
    doctorDetail(){
      doctorDetail({doctorCode: this.$route.query.doctorCode || '18000000002'})
      .then(res=>{
        if(res.data.code == 0){
          this.doctor = res.data.data
        }
      })
    },
    //  绑定结束后立即咨询
    bindDoctor(){
      changeAndBind({cardNo: sessionStorage.getItem('cardNo'), doctorCode: this.$route.query.doctorCode || '18000000002'})
      .then(res=>{
        if(res.data.code == 0){
          this.startVisit()
        } else {
          //  绑定失败
        }
      })
    },
    startVisit(){
      startVisit({cardNo: sessionStorage.getItem('cardNo'), doctorCode: this.$route.query.doctorCode || '18000000002', orderNum: sessionStorage.getItem('orderNum')})
      .then(res => {
        this.$router.replace({path: '/familyDoctor/consultationDetail', query:{
          code: res.data.queueCode,
          id: res.data.visitId
        }})
      })
    }
  }
};
</script>
<style lang="scss" scoped>
@import "./my-doctor-detail.scss";
</style>


