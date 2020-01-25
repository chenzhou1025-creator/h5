const userInfo = r => require.ensure([], () => r(require('@/components/user-info/user-info.vue')), 'consulting')
// 图文咨询路由模块
export default function userInfoMap() {
    let route = [{
        path: '/userInput',
        name: 'userInput',
        meta: {
            title: '在线咨询',
        },
        component: userInfo
    }]
    return route
}