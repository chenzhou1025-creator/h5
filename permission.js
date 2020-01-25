import router from './router'
import iView from 'iview'

router.beforeEach((to, from, next) => {

  iView.LoadingBar.start()
  // 跳转权限管理 login

  let isLogin = sessionStorage.isLogin

  if (isLogin) { // 如果有就直接到首页咯
    next()
  } else {
    if (to.path === '/login' || to.path === '/codelogin' || to.path === '/forget') { // 如果是登录页面路径，就直接next()
      next()
    } else { // 不然就跳转到登录；
      next('/login')
    }
  }
  iView.LoadingBar.finish()
})

router.afterEach(() => {
  iView.LoadingBar.finish() // 结束Progress
})