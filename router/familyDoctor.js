export default function familyDoctorRouterMap() {

  /**
   *  path 跳转的页面地址
   *  name 跳转的页面name * name:'router-name' the name is used by <keep-alive> (must set!!!)
   *  component 加载的模版页面
   * meta 配置权限和左侧菜单选项
   * title 左侧菜单栏的名称
   * icon 左侧菜单栏的icon图标
   * roles 权限控制，数组表示 --- 如果children路由存在，请将权限配置在children
     ---如果没有children 请将路由配制在主路由上

   * addLeftMenu 是否添加到左侧菜单栏
   */
  const familyDoctor = r => require.ensure([], () => r(require('@/components/family-doctor/family-doctor')), 'family-doctor') // 家庭医生
  const MyDoctor = r => require.ensure([], () => r(require('@/components/family-doctor/page/my-doctor')), 'family-doctor') // 我的医生
  const MyDoctorDetail = r => require.ensure([], () => r(require('@/components/family-doctor/page/my-doctor-detail')), 'family-doctor') // 我的医生详情
  const Consultation = r => require.ensure([], () => r(require('@/components/family-doctor/page/consultation')), 'family-doctor') // 我的咨询
  const ConsultationDetail = r => require.ensure([], () => r(require('@/components/family-doctor/page/consulation-detail')), 'family-doctor') // 我的咨询详情（聊天室）


  let apponitmentRoute = [

    {
      path: '/familyDoctor',
      name: 'familyDoctor',
      meta: {
        tabBar: '1',
        addFootBar: true
      },
      component: familyDoctor,
      redirect: '/familyDoctor/myDoctor',

      children: [{
          path: '/familyDoctor/myDoctor',
          name: 'myDoctor',
          meta: {
            tabBar: '1',
            addFootBar: true,
            keepAlive: true
          },
          component: MyDoctor,
        },
        {
          path: '/familyDoctor/consultation',
          name: 'consultation',
          component: Consultation,
          meta: {
            tabBar: '1',
            addFootBar: true,
            keepAlive: false
          }
        },
        {
          path: '/familyDoctor/myDoctorDetail',
          name: 'myDoctorDetail',
          component: MyDoctorDetail,
          meta: {
            tabBar: '1',
            addFootBar: false,
            keepAlive: false
          },
        },
      ]
    },
   
    {
      path: '/familyDoctor/consultationDetail',
      name: 'consultationDetail',
      component: ConsultationDetail,
      meta: {
        tabBar: '1',
        addFootBar: false
      }
    }
  ]

  return apponitmentRoute
}
