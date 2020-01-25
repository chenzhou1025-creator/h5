const channelqrCode = r => require.ensure([], () => r(require('@/components/consulting/consulting.vue')), 'consulting')
// 图文咨询路由模块
export default function consultationMap() {
    let route = [{
        path: '/consult',
        name: 'consult',
        meta: {
            title: '在线咨询',
        },
        component: channelqrCode
    }]
    return route
}