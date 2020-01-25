// 日期转字符串
export function convertDateFromString(dateString) {
    let iMonth = dateString.getMonth() + 1;
    let nowDate = dateString.getDate();
    let year = dateString.getFullYear();
    let Hours = dateString.getHours();
    let m = dateString.getMinutes();
    let s = dateString.getSeconds();

    let dateTemp =
        (iMonth > 9 ? iMonth : "0" + iMonth) +
        "-" +
        (nowDate > 9 ? nowDate : "0" + nowDate);
    return year + '-' + dateTemp + ' ' + Hours + ':' + m + ':' + s
}

// 根据身份证算出年龄

export function GetAgeAndValid(identityCard) {
    var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子   
    var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // 身份证验证位值.10代表X  
    let birth = {
        birthDate: null,
        age: null,
        sex: null
    };

    function IdCardValidate(idCard) {
        idCard = trim(idCard.replace(/ /g, "")); //去掉字符串头尾空格                     
        if (idCard.length == 15) {
            if (isValidityBrithBy15IdCard(idCard) && maleOrFemalByIdCard(idCard)) {
                return birth
            } else {
                return false
            } //进行15位身份证的验证  

        } else if (idCard.length == 18) {
            var a_idCard = idCard.split(""); // 得到身份证数组   
            if (isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard) && maleOrFemalByIdCard(idCard)) { //进行18位身份证的基本验证和第18位的验证
                return birth
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**  
     * 判断身份证号码为18位时最后的验证位是否正确  
     * @param a_idCard 身份证号码数组  
     * @return  
     */
    function isTrueValidateCodeBy18IdCard(a_idCard) {
        var sum = 0; // 声明加权求和变量   
        if (a_idCard[17].toLowerCase() == 'x') {
            a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作   
        }
        for (var i = 0; i < 17; i++) {
            sum += Wi[i] * a_idCard[i]; // 加权求和   
        }
        var valCodePosition = sum % 11; // 得到验证码所位置   
        if (a_idCard[17] == ValideCode[valCodePosition]) {
            return true;
        } else {
            return false;
        }
    }
    /**  
     * 验证18位数身份证号码中的生日是否是有效生日  
     * @param idCard 18位书身份证字符串  
     * @return  
     */
    function isValidityBrithBy18IdCard(idCard18) {
        var year = idCard18.substring(6, 10);
        var month = idCard18.substring(10, 12);
        var day = idCard18.substring(12, 14);
        var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        birth.birthDate = temp_date // 生日
        let nowDateTime = new Date();
        birth.age = nowDateTime.getFullYear() - birth.birthDate.getFullYear(); // 年龄
        //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
        if (nowDateTime.getMonth() < birth.birthDate.getMonth() || (nowDateTime.getMonth() == birth.birthDate.getMonth() && nowDateTime.getDate() < birth.birthDate.getDate())) {
            birth.age--;
        }
        // 这里用getFullYear()获取年份，避免千年虫问题   
        if (temp_date.getFullYear() != parseFloat(year) ||
            temp_date.getMonth() != parseFloat(month) - 1 ||
            temp_date.getDate() != parseFloat(day)) {
            return false;
        } else {
            return true;
        }
    }

    /**  
     * 验证15位数身份证号码中的生日是否是有效生日  
     * @param idCard15 15位书身份证字符串  
     * @return  
     */
    function isValidityBrithBy15IdCard(idCard15) {
        var year = idCard15.substring(6, 8);
        var month = idCard15.substring(8, 10);
        var day = idCard15.substring(10, 12);
        var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        birth.birthDate = temp_date // 生日
        let nowDateTime = new Date();
        birth.age = nowDateTime.getFullYear() - birth.birthDate.getFullYear(); // 年龄
        //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
        if (nowDateTime.getMonth() < birth.birthDate.getMonth() || (nowDateTime.getMonth() == birth.birthDate.getMonth() && nowDateTime.getDate() < birth.birthDate.getDate())) {
            birth.age--;
        }
        // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法   
        if (temp_date.getYear() != parseFloat(year) ||
            temp_date.getMonth() != parseFloat(month) - 1 ||
            temp_date.getDate() != parseFloat(day)) {
            return false;
        } else {
            return true;
        }
    }
    //去掉字符串头尾空格   
    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    /**  
     * 通过身份证判断是男是女  
     * @param idCard 15/18位身份证号码   
     * @return 'female'-女、'male'-男  
     */
    function maleOrFemalByIdCard(idCard) {
        idCard = trim(idCard.replace(/ /g, "")); // 对身份证号码做处理。包括字符间有空格。   
        if (idCard.length == 15) {
            if (idCard.substring(14, 15) % 2 == 0) {
                birth.sex = '2'; // 1代表男性，2代表女性
                return 'female';
            } else {
                birth.sex = '1'; // 1代表男性，2代表女性
                return 'male';
            }
        } else if (idCard.length == 18) {
            if (idCard.substring(14, 17) % 2 == 0) {
                birth.sex = '2'; // 1代表男性，2代表女性
                return 'female';
            } else {
                birth.sex = '1'; // 1代表男性，2代表女性
                return 'male';
            }
        } else {
            return null;
        }
    }

    return IdCardValidate(identityCard)


}


// 数据字典分类数据
export function classificateData(data) {
    let list = {}
    data.forEach(element => {
        if (!list[element.typeCode]) {

            list[element.typeCode] = []
        }
        list[element.typeCode].push(element)
    })
    return list
}

//时间格式化
export function formatDateTime(date) {
    date = new Date(date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var m1 = date.getMinutes();
    var s = date.getSeconds();
    m = m < 10 ? ("0" + m) : m;
    d = d < 10 ? ("0" + d) : d;
    h = h < 10 ? ("0" + h) : h;
    m1 = m1 < 10 ? ("0" + m1) : m1;
    s = s < 10 ? ("0" + s) : s;

    return y + "-" + m + "-" + d + " " + h + ":" + m1 + ":" + s;
}