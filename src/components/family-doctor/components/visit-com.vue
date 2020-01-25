<template>
    <div class="visit-com-container">
              <div class="doctor-headImg">
                <img src="../../../assets/images/icon_doctor.png" alt="">
              </div>
              <ul>
                <li>
                    <span>{{visit.doctorName || '大象医生'}}</span>
                    <span>{{visit.deptName}}</span>
                    <span>{{visit.doctorTitleName}}</span> 
                  </li>
                  <li>
                      <span>{{visit.createTime || ''}}</span> 
                  </li>
                </ul>
                <div class="arrow">
                   <img src="../../../assets/images/icon_arrow.png" alt="">
                </div>
            </div>
</template>
<script>
export default {
    name: 'visit-com',
    props: {
        visit: {
            type: Object,
            default: {}
        }
    }
}
</script>
<style lang="scss" scoped>
@import './visit-com.scss'
</style>


