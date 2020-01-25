import axios from 'axios' // 引入axios
import * as hostUrl from './env.js'
import Vue from 'vue'
import {Toast} from 'vant'

function apiAxios(method, datas) {
    
    // 返回在vue模板中的调用接口 needToken--请求时header是否需要添加token
    /**
     * url--传入接口地址、
     * params--传入参数、
     * needToken--是否需要Authorization 头信息、
     * headers--添加新的头信息、
     * showLoadBooler--判断这个接口是否需要loading如聊天界面发消息时候就不需要
     * errorCallback -- 错误需要回调的函数
     * */
    if(!datas.notNeedLoading){
        Toast.loading({
            message: '加载中...'
        });
    }
    
    let rootUrl = hostUrl.publicApi
    if(datas.hostUrl){
        rootUrl = datas.hostUrl
    }
    let config = {
        method: method,
        url: datas.url,
        headers: mergeHeader(datas.needToken, datas.header),
        data: method === 'POST' || method === 'PUT' ? datas.data : null,
        params: method === 'GET' || method === 'DELETE' ? datas.data : null,
        baseURL: rootUrl
    }
    return new Promise((resolve, reject) => {
        axios(config)
            .then(res => { // then 请求成功之后进行什么操作
                Toast.clear();
                if (res.data.code === 200 || res.data.operationState === 'SUCCESS') {
                    if (datas.successAlertMsg) {
                        Toast.success(datas.successAlertMsg || '更新成功')
                    }
                    resolve(res)
                } else {
                    errorHandle(res)
                }
            })
            .catch(error => {
                Toast.fail(error || '更新失败');
                Toast.clear();
            })
    })
}

function errorHandle(res) {
    // 更新失败后的错误提示信息
    let parm = res.data.message || res.data.msg.toString() || res.data.error.toString() ||  res.data.errors.toString()

    // if (res.data.errors && res.data.errors.length) {
    //     parm = res.data.errors && res.data.errors.length ? res.data.errors.toString() : ''
    // } else if (res.data.error && res.data.error.length) {
    //     parm = res.data.error && res.data.error.length ? res.data.error.toString() : ''
    // } else {
    //     parm = res.data.msg && res.data.msg.length ? res.data.msg.toString() : ''
    // }
    Toast.fail(parm);
    // reject(res)
}

function mergeHeader(needToken, headers) {
    let h = {
        'Content-Type': 'application/json',
        'applicationCode': 'YJK',
    }
    if (needToken) {
        h['token'] = sessionStorage.access_Token || ''
    }
    if (headers) {
        for (let k in headers) {
            if (headers.hasOwnProperty(k)) {
                h[k] = headers[k]
            }
        }
    }
    return h
}

export default {
    Get: async function (parm) {
        const get = await apiAxios('GET', parm)
        return get
    },
    Post: async function (parm) {
        const post = await apiAxios('POST', parm)
        return post
    },
    Put: async function (parm) {
        const put = await apiAxios('PUT', parm)
        return put
    },
    Delete: async function (parm) {
        const deletes = await apiAxios('DELETE', parm)
        return deletes
    }
}