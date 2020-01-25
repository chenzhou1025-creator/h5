<template>
    <div class="dx-doctor-service">
        <div class="top-remind">
            <img src="../../assets/images/yz_banner.png" alt="">

            <p>请完善信息，以便医生给出更准确的判断，信息仅医生可见</p>
        </div>
        <div class="box">
            <div class="user-info name">
                <div class="title">
                    姓名：
                </div>
                <input type="text" maxlength="20" minlength="2" v-model="name" placeholder="请输入真实姓名">
            </div>
            <div class="user-info name">
                <div class="title">
                    性别：
                </div>
                <div class="gender">
                    <div :class="{active: gender == 1}" @click="changeGender(1)">男</div>
                    <div :class="{active: gender == 0}" @click="changeGender(0)">女</div>
                </div>
            </div>
            <div class="user-info name">
                <div class="title">
                    年龄：
                </div>
                <input type="text" pattern="[0-9]*" maxlength="3" v-model="age" placeholder="请输入年龄">
            </div>
            <div class="user-info name">
                <div class="title">
                    手机号码：
                </div>
                <input type="text" pattern="[0-9]*" maxlength="11" v-model="phone" placeholder="请输入手机号码">
            </div>
            <div class="user-info name">
                <div class="title">
                    身份证号：
                </div>
                <input type="text" class="user-id" pattern="/^(\d|X|x)$/" maxlength="18" v-model="idCardNumber" placeholder="请输入身份证号">
            </div>
        </div>
        <div class="immediate-consultation-btn" @click="serviceBtn()">
            马上问诊
        </div>
    </div>
</template>

<script>
import { GetAgeAndValid } from '../../utils/js/util.js'

import { userInputHost } from '../../utils/js/env' // 接口地址
import { userinputUrl } from '../../utils/api/userInput'
export default {
    name: 'defaultTheme',
    data: function(){
        return {
            chId: '',
            channelId:'1',
            qrcode:'',

            gender: null,
            name:'',
            age:'',
            phone:'',
            resPhoneNum: /^0?(1[3456789])[0-9]{9}$/,//手机号校验
            currentPrice: '',
            goodsId:'',
            idCardNumber:''
        }
    },
    created() {
        this.chId = this.$router.history.current.query.chId
        this.channelId = this.$router.history.current.query.channelId
        this.chId = decodeURIComponent(this.chId)
        this.postUserInfo()
    },
    mounted(){
        document.body.addEventListener('focusout', this.listenFocusOut,false);
    },
    methods: {
        // 监听ios键盘收起
        listenFocusOut(){
            window.scroll(0,0);
        },
        async postUserInfo(){ //保存用户信息
            let parm = {
                url:userinputUrl,
                hostUrl: userInputHost,
                data:{
                    type:0 //零时二维码
                }
            }
           let list = await this.$Http.Post(parm)
        },
        async serviceBtn(){
            // 校验
            if(!this.name) return this.$toast.fail('请输入真实姓名');
            if(this.name && this.name.length == 1) return this.$toast.fail('请输入真实姓名');
            if(this.gender == null) return this.$toast.fail('请选择性别');
            if(!this.age) return this.$toast.fail('请输入年龄');
            if(this.age && (this.age < 1 || this.age > 150)) return this.$toast.fail('请输入正确的年龄');
            if(!this.phone) return this.$toast.fail('请输入手机号码');
            if(!this.resPhoneNum.test(this.phone)) return this.$toast.fail('请输入正确的手机号码');
            if(!this.idCardNumber) return this.$toast.fail('请输入身份证号');
            

            const idCardNumber = GetAgeAndValid(this.idCardNumber)
            if(!idCardNumber){
                return this.$toast.fail('请输入正确的身份证号')
            }
            // 请求接口

            // await  todo something.....

            // 跳转
            this.$router.push({
                path: '/familyDoctor/myDoctor',
                query: {
                    orderNum: this.phone,
                    cardNo: this.idCardNumber
                }
            })
        },
        // 切换性别
        changeGender(sign){
            this.gender = sign;
        },
    }
}
</script>  
<style lang="scss">
  @import "./user-info.scss";
</style>