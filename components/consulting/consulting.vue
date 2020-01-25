<template>
    <div>
      我的医生 我的咨询
    </div>
</template>

<script>
import { addAPi } from '../../utils/api/commonApi.js'
import { channelCodeList } from '../../utils/js/code_name.js'
export default {
    name: 'defaultTheme',
    data: function(){
        return {
            chId: '',
            channelId:'1',
            qrcode:''
            
        }
    },
    created() {
        
        this.chId = this.$router.history.current.query.chId
        this.channelId = this.$router.history.current.query.channelId
        this.chId = decodeURIComponent(this.chId)
        this.getQRcode() 
    },
    methods: {
        async getQRcode(){
            let index = channelCodeList.findIndex(res=>res.channelId==this.channelId)
            let channelCode = channelCodeList[index].code
            let sourceType = channelCodeList[index].sourceType
            let parm = {
                url:addAPi,
                data:{
                    type:0, //零时二维码
                    sourceType: sourceType, //区分不同的第三方二维码
                    channelCode: channelCode,//渠道code
                    chId:this.chId //用户ID
                }
            }
           let list = await this.$Http.Post(parm)
            this.qrcode = list.data.data
        }
    }
}
</script>  
<style lang="scss">
  @import "./consulting.scss";
</style>