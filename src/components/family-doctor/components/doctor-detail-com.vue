<template>
    <div>
        <div class="avar-box">
            <div class="doctor-detail">
                <div>
                    <img src="../../../assets/images/photo_doctor.png" alt="">
                </div>
                <ul>
                    <li>
                        <div>
                           <span>{{doctor.doctorName}}</span>
                           
                        </div>
                        <span class="online-status">{{doctor.online == 1 ? '在线' : '离线'}}</span>
                    </li>
                    <li>
                        <span style="margin-right: 10px">{{doctor.doctorTitleName}}</span> 
                        <span>{{doctor.deptName}}</span>
                    </li>
                    <li>
                        <span>{{doctor.orgName}}</span>
                    </li>
                    <li>
                        <div>
                            <img v-for="v in Math.round((doctor.evaluationScore || 100)/20)" :key="v" src="../../../assets/images/icon_star3.png" alt="">
                            <span>{{doctor.evaluationScore || 100}}%</span>
                        </div>
                        <span>服务人次: {{doctor.serviceCount || 0}}</span>
                    </li>
                </ul>
            </div>
            <slot name="control"></slot>    
        </div>
        <div class="doctor-introduce">
            <h6 class="vue-1px-t">医生简介</h6>
            <p>{{doctor.briefIntroduction}}</p>
        </div>
        <div class="doctor-introduce">
            <h6 class="vue-1px-t">医生擅长</h6>
            <p>{{doctor.goodAt}}</p>
        </div>
    </div>
</template>
<script>
export default {
    name: 'DoctorDetailCom',
    props: {
        doctor: {
            type: Object,
            default: {}
        }
    }
}
</script>
<style lang="scss" scoped>
@import './doctor-detail-com.scss'
</style>


