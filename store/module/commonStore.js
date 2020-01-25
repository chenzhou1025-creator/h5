import requestApi from '@/utils/js/http'
export default {
    state: {
        page: {
            // 分页数
            arrPageSize: [15, 30, 50, 100],
            // 分页大小
            pageSize: 15,
            // 总分页数
            pageCount: 1,
            // 当前页面
            pageCurrent: 1,
            // 总数
            totalCount: 1
        },
        normalDataList: [],
        addFootBar: true, // 是否添加底部菜单栏
        oneStepList: [],
        twoStepList: [],
        threeStepList: [],
        fourStepList: [],
        fiveStepList: [],
        sixStepList: [],
        updateNormalData: false,
        userInfo: {},
        isLoading: false,
        cardNohasUpdated: false
    },
    mutations: {
        // 控制loading显示隐藏
        updateLoadingStatus(state, payload) {
            state.isLoading = payload.isLoading
        },
        updateFooterBar(state, status) {
            state.addFootBar = status
        },
        updatecardNo(state, hasUpdated) {
            state.cardNohasUpdated = hasUpdated
        }
    },
    actions: {
        // get 普通格式的数据请求
        async getNormalDataList({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.normalDataList = res.data
            if (param.isPageSize) {
                res.isPageSize = param.isPageSize;
            }
            return res
        },
        // get 普通格式的数据请求
        async getOneStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.oneStepList = res.data
            return res
        },
        // get 普通格式的数据请求
        async getTwoStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.twoStepList = res.data
            return res
        },
        // get 普通格式的数据请求
        async getThreeStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.threeStepList = res.data
            return res
        },
        // get 普通格式的数据请求
        async getFourStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.fourStepList = res.data
            return res
        },
        // get 普通格式的数据请求
        async getFiveStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.fiveStepList = res.data
            return res
        },
        // get 普通格式的数据请求
        async getSixStep({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Get(param)
            state.isLoading = false // loading
            state.sixStepList = res.data
            return res
        },
        // post 普通格式的数据更新请求
        async updateANormalData({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Post(param)
            state.isLoading = false // loading
            return res
        },
        // put 普通格式的数据更新请求
        async putANormalData({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Put(param)
            state.isLoading = false // loading
            return res
        },
        // delete 普通格式的数据更新请求
        async deleteANormalData({
            commit,
            state
        }, param) {
            state.isLoading = true // loading
            let res = await requestApi.Delete(param)
            state.isLoading = false // loading
            return res
        }
    }
}