import Hud from '../components/Hud';
import { BASE_URL } from '../utils/config';
import { queryString } from '../utils';
import md5 from 'md5';

const STATE_SUCCESS = 0;

function handleRequestResult(response, success, fail) {
    if (response.status >= 200 && response.status < 300) {        
        response.json().then(data => {
            console.log(data);
            if(data.err_code !== STATE_SUCCESS) {
                Hud.showMessage(data.err_msg);
                handleError(response, fail);
            }
            else {
                success && success(data.result);
            }
        });
    }
    else {
        Hud.showMessage('请求数据错误');
        handleError(response, fail);
    }
}

function handleError(response, fail) {
    console.log(response);
    const error = new Error(response.statusText);
    error.response = response;
    fail && fail(error);
}

class JsonRequestHelper {
    static paramsSigned(params) {
        let timeObj = {time:new Date().getTime() / 1000};
        let outputParams = params !== undefined ? Object.assign({}, params, timeObj) : timeObj;
            
        let currentUser = global.store.getState().user.currentUser;
        if (currentUser) {
            outputParams = {
                ...outputParams,
                uid: currentUser.uid,
                token: currentUser.token,
                access_token: currentUser.access_token,
                open_uid: currentUser.open_uid
            }
        }

        let gameInfo = global.kfgame_info;
        let sdkInfo = global.h5_sdk;
        outputParams = {
            ...outputParams,
            bundle_id: global.h5_sdk.bundleId,
            app_id: gameInfo ? gameInfo.appId : '',
            os: 3,
            idfa: sdkInfo.idfa ? sdkInfo.idfa : '',
            imei: sdkInfo.imei ? sdkInfo.imei : '',
            client_id: sdkInfo.clientID ? sdkInfo.clientID : ''
        }
    
        let paramsToSign = Object.assign({}, outputParams, {app_secret: gameInfo ? gameInfo.appSecret : ''});
        let arrayOfKeys = Object.keys(paramsToSign).sort();
        let signStr = '';
        arrayOfKeys.forEach((currentValue, index, array) => {
          signStr += `${currentValue}=${paramsToSign[currentValue]}${(index !== array.length - 1) ? '&' : ''}`;
        });
        let signVal = md5(signStr);
        
        return Object.assign({}, outputParams, {sign: signVal});
    }

    static async get(path, params, success, fail) {
        let url = `${BASE_URL}${path}`;        
        let outputParams = this.paramsSigned(params);
        console.log(url,outputParams);
        let pathWithParams = `${url}?${queryString(outputParams)}`;

        const response = await fetch(pathWithParams, {
            method: 'GET',
        });
        handleRequestResult(response, success, fail);
    }

    static async post(path, params, success, fail) {
        let url = `${BASE_URL}${path}`;
        let outputParams = this.paramsSigned(params);
        const body = JSON.stringify(outputParams);
        console.log(url,outputParams);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body,
        });
        handleRequestResult(response, success, fail);
    }
}

export default JsonRequestHelper;


// WEBPACK FOOTER //
// ./src/services/index.js