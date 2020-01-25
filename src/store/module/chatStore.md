
### 本地消息原型
        message: {
             content:'',
              type: '',
              id: '',
              isSend: ''
              senderCode: ''，
              time： 1569568477
            }

### MSG_TEXT

| 类型 | 说明                           |  展示字段                           |
| ---- | ------------------------------ | content === 文本信息
| text | 文本类型消息 |

### MSG_CUSTOM 类型消息描述 => key => data // 类型   重写
                              key => description => content // 主体内容
                              key => extension  //  扩展字段 暂存消息id

| 类型  |  说明                           |  展示字段                           |
| ----  | ------------------------------ | ------------------------------------|
| image | 图片类型消息                    |  content => JSON.stringfy(img.src)  |
| file  | 文件类型消息                    |  content => JSON.stringfy(file.url) |
| system  | 系统类型消息                  |  content => JSON.stringfy(Object)   |
| custom  | 自定义类型消息                |  content => JSON.stringfy(Object)   |


####  system/custom类型消息详解

* 数据模板
var Object = {
                subType: 'prescription', // 二级类型 必传
                isDiagnosis: false, // 是否属于诊断记录
                diagnosisId: '', 诊断id 处方、检查检验id 
                template: ''， //  可选模板 text textImage label  必传
                title: '', //  
                subTitle: '',  //
                contentText: '抱歉，由于您提交的病情不对症，医生已为您退诊，请选择对症的医生重新提交。服务相关费用将会在3个工作日内返回您的付款账户',
                contentImage: [],
                contentLabel: { // template为label时必传
                    '开药医院': '上海是交通大学医学院附属新华医院',
                    '开药时间': '2017.03.12',
                    '2017.03.12': '头孢丙烯分散片  x2\n头孢丙烯分散片头孢丙烯分散片  x1',
                },
                notOperation: false, // 底部不能点击 默认可点击
                footTemplate: 'textIcon', // textIcon, iconText, btn // 暂时只有textIcon
                footText: '' // 有则代表存在foot
            }

> system/custom类型 => subType 

### 医生推送用户
* addmsg 增加回复条数  * 医生已为您新增了X条回复数，您目前还有Y条可以回复
* endVisit 结束问诊   * 您的本次问诊已结束，祝您身体健康    弹窗： 您的问诊已结束，请到历史咨询中查看
* returnVisit 医生退诊  * 抱歉，由于您提交的病情不对症，医生已为您退诊。相关服务费将会在3个工作日内返回您的付款账户中。
* chooseStore  医生推送用户选择门店  * 请选择您将要去检查的门店
* medicalRecord  医生填写电子病历
* inspection  医生填写检查检验
* prescription  医生填写电子处方

### 客服推送用户
* manageTriage  客服请求会话  * 您提交的病情/病历信息存在问题，将由医生助理与您沟通后再转诊给医生
* manageChooseDoctor  客服推送用户选择医生  * 您的医生已分配完成，请点击“这里”查看
* manageCancelTriage  客服推送用户驳回  * 医生助理已为您退诊。服务相关费用将会在 3 个工作日内返回您的付款账户

### 用户推送医生
* diagnosis // 诊断信息
* hospitalization // 住院信息
* chooseStoreSuc 选择门店成功 * 我已选择哪个哪个门店
