import requestApi from '@/utils/js/http'
/**
 * 获取tim登录sig接口
 * @param {* FormData } data - userId
 */
export function getLoginInfo2 (data) {
    return requestApi.Get({
        url: '/webrtc/weapp/webrtc_room/get_login_info2',
        data: {
            userID: data.userID
        },
        controller: {
          needToken:false,
          successAlertMsg: '' //上传完毕弹窗信息  此处不需要
        }
    })
}
/**
 * 上传文件接口
 * @param {* FormData } data - 上传文件的参数 code(用户code)  modularType(类型) file(文件)
 */
export function uploadFile(data) {
    return requestApi.Post({
        url: '/sysfile-oss/sysFile/uploadFile',
        data: data,
        controller: {
            needToken: false,
            successAlertMsg: '' //上传完毕弹窗信息  此处不需要
        }
    })
}
/**
 * 获取聊天历史记录
 * @param {* Object } data - queueCode(问诊编号)
 */
export function getListByQueueCode(data) {
    return requestApi.Post({
        url: '/savr/visitConsultationIM/getListByQueueCode?queueCode=' + data.queueCode,
        data: {
            queueCode: data.queueCode
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //上传完毕弹窗信息  此处不需要
        }
    })
}

/**
 * 保存聊天信息
 * @param {* Object } data - 需要保存的聊天信息
 */
export function saveOne(data) {
    return requestApi.Post({
        url: '/elephant-admin/userVisitOrder/savrUserVisitIm',
        data: {
            doctorCode: data.doctorCode, // 医生code
            headUrl: data.headUrl || null, // 用户头像
            msgContent: data.msgContent, // 聊天信息
            msgType: data.msgType, // 信息类型
            queueCode: data.queueCode, // 问诊code
            readStatus: data.readStatus || '0', // 是否已读
            senderCode: data.senderCode, // 发送方code
            userCode: data.userCode, // 用户code
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //上传完毕弹窗信息  此处不需要
        }
    })
}

/**
 * 获取问诊信息
 * @param {* Object } data - 获取问诊信息
 */
export function getVisitStatusById(data) {
    return requestApi.Get({
        url: '/elephant-admin/userVisitOrder/getVisitConsultationQueueUserfindById',
        data: {
            id: data.id
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //上传完毕弹窗信息  此处不需要
        },
        notNeedLoading: true
    })
}

/**
 * 更换绑定
 * @param {* Object } data - 问诊卡号和医生code
 */
export function changeAndBind(data) {
    return requestApi.Post({
        url: '/elephant-medicalreport/familyDoctor/changeAndBind',
        data: {
            cardNo: data.cardNo,
            doctorCode: data.doctorCode,
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

/**
 * 医生详情
 * @param {* Object } data - 医生code
 */
export function doctorDetail(data) {
    return requestApi.Get({
        url: '/elephant-medicalreport/familyDoctor/doctorDetail',
        data: {
            doctorCode: data.doctorCode,
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

/**
 * 我的医生列表
 * @param {* Object } data - 问诊卡号和分页信息
 */
export function myDoctors(data) {
    return requestApi.Get({
        url: '/elephant-medicalreport/familyDoctor/myDoctors',
        data: {
            cardNo: data.cardNo,
            pageNum: data.pageNum || 1,
            pageSize: data.pageSize || 15,
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

/**
 * 立即咨询
 * @param {* Object } data - cardNo
 */
export function startVisit(data) {
    console.log(data)
    return requestApi.Get({
        url: '/elephant-medicalreport/familyDoctor/startAppVisit',
        data: {
            cardNo: data.cardNo, // 问诊卡号
            doctorCode: data.doctorCode,
            orderNum: data.orderNum
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

/**
 * 我的咨询
 * @param {* Object } data - userCode
 */
export function myVisit(data) {
    return requestApi.Get({
        url: '/elephant-medicalreport/familyDoctor/myVisit',
        data: {
            cardNo: data.cardNo,
            pageSize: 15,
            pageNum: data.pageNum,
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

/**
 * 评价问诊
 * @param {* Object } data
 */
export function saveVisitServiceEvaluate(data) {
    return requestApi.Post({
        url: '/savr/visitServiceEvaluate/saveVisitServiceEvaluate',
        data: {
            doctorCode: data.doctorCode,
            score: data.score,
            typeCode: data.typeCode,
            userCode: data.userCode,
            visitCode: data.visitCode,
        },
        controller: {
            needToken: false,
            successAlertMsg: '' //弹窗信息  此处不需要
        }
    })
}

export const updateFile = `/sysfile-oss/sysFile/uploadFile` //sso文件上传服务
