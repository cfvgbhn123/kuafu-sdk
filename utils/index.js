const uuidv1 = require('uuid/v1');

const checkPhone = (phone) => {
    return phone.length === 11;
}

const checkAccount = (string) => {
    return /^(?![0-9]+$)[0-9A-Za-z_]{6,20}$/.test(string);
}

const checkEmoji = (string) => {
    return /^[\u4E00-\u9FA5\uF900-\uFA2D\d\w]+$/.test(string);
}

const checkRequiredParam = (keys, object) => {
    for (let index = 0; index < keys.length; index++) {
        const element = object[keys[index]];
        if (!element) {
            return false;
        }
    }
    return true;
}

const queryString = (object) => {
    let queryString = "";
    for (let key in object) {
        queryString = queryString + `${key}=${encodeURI(object[key])}&`;
    }
    return queryString;
}

const parseQueryString = (url) => {
    let reg_url = /^[^?]+\?([\w\W]+)$/;
    let reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g;
    let arr_url = reg_url.exec(url);
    let ret = {};
    if (arr_url && arr_url[1]) {
     let str_para = arr_url[1], result;
     while ((result = reg_para.exec(str_para)) != null) {
      ret[result[1]] = decodeURIComponent(result[2]);            
     }
    }
    return ret;
}

const getUUID = () => {    
    return uuidv1();
}

module.exports = {
    checkPhone,
    checkAccount,
    checkEmoji,
    checkRequiredParam,
    queryString,
    parseQueryString,
    getUUID
}


// WEBPACK FOOTER //
// ./src/utils/index.js