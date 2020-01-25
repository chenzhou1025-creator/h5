import Vue from 'vue'
import VueRouter from 'vue-router'
import consultMap from './consulting.js'
import userInfoMap from './userInfo.js'
import familyDoctorRouterMap from './familyDoctor.js'

Vue.use(VueRouter)
const Login = r => require.ensure([], () => r(require('@/components/login/login')), 'login') // 登录界面
const NotFound = resolve => require(['@/components/no_Found/404.vue'], resolve) // 404 no found
const Index = r => require.ensure([], () => r(require('@/components/index')), 'index') // 首页

let consultRouter = consultMap() // 数据统计
let familyDoctorRouter = familyDoctorRouterMap() // 家庭医生
let userInfoMapRouter = userInfoMap() //用户信息录入页面
let indexChild = [...consultRouter, ...familyDoctorRouter, ...userInfoMapRouter]
let Routers = [{
        path: '/login',
        name: 'Login', // * name:'router-name' the name is used by <keep-alive> (must set!!!)
        component: Login
    },
    {
        path: '/',
        redirect: '/familyDoctor',
        component: Index,
        meta: {
            roles: ['admin'],
            addTopMenu: true // 添加到左侧菜单栏
        },
        children: indexChild
    },
    {
        path: '*',
        component: NotFound
    }
]

// apply模块路由 新增的路由排最前面
Routers = [...Routers]
export default new VueRouter({
    mode: 'history',
    routes: Routers
})