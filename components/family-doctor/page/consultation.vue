<template>
  <div style="height: calc( 100vh - 50px );overflow-y: auto;">
    <div v-if='!visitList || visitList.length==0'>
        <noFound text='暂无咨询记录'></noFound>
    </div>
    <div>
        <pull-refresh  v-model="loading" @refresh="loadTop">
            <list
            ref="list"
            v-model="loading"
            :finished="isLoaded"
            finished-text="已加载全部数据"
            @load="loadBottom"
        >
                <visit-com v-for="(v,i) in  visitList" :key="i" :visit="v" @click.native="goToDetail(v)" />
            </list>
        </pull-refresh>
    </div>
    
  </div>
</template>
<script>
    import noFound from '@/components/common/no-found/no-found'
    import VisitCom from '../components/visit-com'
    import { myVisit } from "@/utils/api/familyDoctor.js";
    import { mapState, mapActions, mapMutations } from "vuex";
    import { List, PullRefresh } from 'vant'
    export default {
        name: "Consultation",
        components: {
            // Badge,
            noFound,
            List,
            PullRefresh,
            VisitCom
        },
        data: function() {
            return {
                loading: false,
                isLoaded: true,
                pageNum: 1,
                visitList: []
            };
        },
        created() {
            this.myVisit()
        },
        mounted() {
            console.log('>>>>>>', this.$refs.list)
        },
        methods: {
            init(){
                this.loading= false
                this.isLoaded= true
                this.pageNum= 1
                this.visitList= []
            },
            loadTop() {
                this.init();
                this.myVisit()
            },
            // 上啦加载
            loadBottom() {
                console.log('loadBottom')
                if(!this.isLoaded){
                    this.pageNum++
                    this.myVisit()
                } 
            },
            myVisit(){
                myVisit({
                    cardNo: sessionStorage.cardNo,
                    pageNum: this.pageNum
                })
                .then(res => {
                    this.loading = false
                    if(res.data.code == 0){
                        if(this.pageNum == 1) this.visitList =[]
                        this.visitList = this.visitList.concat(res.data.list)
                        this.isLoaded = this.visitList.length < res.data.total ? false : true
                    }
                })
            },
            goToDetail(data){
                this.$router.push({path: '/familyDoctor/consultationDetail', query:{
                    code: data.code,
                    id: data.id,
              }})
            }
        }
    };
</script>