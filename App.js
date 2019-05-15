import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import PubSub from 'pubsub-js'; 
import JsonRequestHelper from './services';
import { Events } from './utils/config';
import Container from './views/Container';
import { UIAction, UserAction, PayAction } from './store/actions';
import reducer from './store/reducers';
import Utils from './utils';
import Hud from './components/Hud';
import './App.css';

let store = createStore(reducer);

store.subscribe(() => {
  console.log(store.getState());
});

global.store = store;

class App extends Component {
  state = {
    showGame: false,
  }

  sdk_type = 'web';

  componentWillMount() {
    // 处理原生的回调
    global.nativeCallback = (type, data) => {
      PubSub.publish(type, data);
    }

    // 获取url的游戏参数
    // package_name=com.kuafu.test&idfa=66F8B3A8-AF43-4823-986E-AC3D09E22EAD&game_url=h5_demo.html&sdk_type=web&login_bg=http%3a%2f%2fcdn.kuafugame.com%2fimages%2fgame_bg%2fjzscdjb.jpg&orientation=1&imei=
    let gameParams = Utils.parseQueryString(window.location.href);    
    this.sdk_type = gameParams.sdk_type ? gameParams.sdk_type : 'web';
    
    if (gameParams.package_name && gameParams.game_url) {
      global.h5_sdk = {
        bundleId: gameParams.package_name,
        gameUrl: gameParams.game_url,
        loginBg: gameParams.login_bg ? gameParams.login_bg : '',
        orientation: gameParams.orientation
      }
      this.setState({showGame: true});
      let idfa = gameParams.idfa;
      let imei = gameParams.imei;
      if (idfa) {
        global.h5_sdk.idfa = idfa;
      }
      if (imei) {
        global.h5_sdk.imei = imei;
      }
      // web生成uuid
      if (!idfa && !imei) {
        let client_id = '';
        if (window.localStorage) {
          client_id = localStorage.getItem("clientID") ? localStorage.getItem("clientID") : Utils.getUUID();
          localStorage.setItem("clientID", client_id);
        }
        global.h5_sdk.clientID = client_id ? client_id : Utils.getUUID();   
      }
    }
  }

  componentDidMount() {
    // 屏幕方向
    if (window.webkit && global.h5_sdk.orientation) { // 1=portrait 2=landscape
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "setScreenOrientation",
        parameter: {
            orientation: global.h5_sdk.orientation
        }
      });
    }

    global.addEventListener('message', (e) => {
      let action = e.data.action;
      let params = e.data.data;
      console.log(action,params);
      if (action === 'initSDK') {
        this.handleInitSDK(params);
      }
      else if (action === 'login') {
        this.handleLogin();
      }
      else if (action === 'logout') {
        this.handleLogout();
      }
      else if (action === 'pay') {
        this.handlePay(params);
      }
      else if (action === 'uploadRoleInfo') {
        this.handleUploadRoleInfo(params);
      }
      else if (action === 'showFloatIcon') {
        this.handleShowFloatIcon();
      }
      else if (action === 'hideFloatIcon') {
        this.handleHideFloatIcon();
      }

    });

    if(window.localStorage) {
      let accountList = JSON.parse(localStorage.getItem("accountList")) || [];
      if (accountList.length) {
        store.dispatch(UserAction.setAccountList(accountList));
      }
    }
  }

  handleInitSDK(params) {
    let { sdk_type } = this;
    if (sdk_type === 'web') {
      global.kfgame_info = {
        ...global.kfgame_info,
        appId: params.app_id,
        appSecret: params.app_secret,
        orientation: params.orientation
      }
      JsonRequestHelper.post('api/app/open', null, () => {
        console.log("请求应用启动接口成功");
      });
      // 激活
      if (window.localStorage) {
        let isActivate = localStorage.getItem("userActivate");
        if (!isActivate) {
          JsonRequestHelper.post('api/activate').then(() => {            
            localStorage.setItem("userActivate", "true");
          });
        }
      }
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "initSDK",
        parameter: {
            ...params,
            callback: "nativeCallback"
        }
      });
    }
  }

  handleLogin() {
    if (window.h5_sdk.loginBg) {
      store.dispatch(UIAction.setShowLoginBg(true));
    }

    let { sdk_type } = this;
    if (sdk_type === 'web') {
      store.dispatch(UIAction.setShowLoginView(true));
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "startLogin"
      });
    }
  }

  handleLogout() {
    let { sdk_type } = this;
    if (sdk_type === 'web') {
      store.dispatch(UIAction.setShowFloatIcon(false));
      store.dispatch(UserAction.unsetCurrentUser());
      PubSub.publish(Events.LOGOUT_SUCCESS, JSON.stringify({code: "",msg: ""}));
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "userLogout"
      });
    }
  }

  handlePay(params) {
    let keys = ['order_id','product_id','product_name','pay_price','server_id','role_id','notify_url'];
    if (!Utils.checkRequiredParam(keys, params)) {
      Hud.showMessage('缺少必要参数');
      return;
    }
    let payParams = params;
    for (const key in payParams) {
      if (key === 'pay_price') {
        payParams[key] = Number(payParams[key]);
      }
      else {
        payParams[key] = payParams[key].toString();
      }
    }

    let { sdk_type } = this;
    if (sdk_type === 'web') {
      store.dispatch(UIAction.setShowFloatIcon(false));
      store.dispatch(UIAction.setShowPayView(true));
      store.dispatch(PayAction.setPayInfo(payParams));
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "onPay",
        parameter: payParams,
      });
    }
  }

  handleUploadRoleInfo(params) {
    let { sdk_type } = this;
    if (sdk_type === 'web') { 
      JsonRequestHelper.post('api/user/roleInfo',params,(data) => {
        console.log('上传用户信息成功');
      });
    }
    else if (this.sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
        functionName: "uploadRoleInfo",
        parameter: params
      });
    }
  }

  handleShowFloatIcon() {
    let { sdk_type } = this;
    if (sdk_type === 'web') { 
      store.dispatch(UIAction.setShowFloatIcon(true));
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
          functionName: "showAssistiveTouch"
      });
    }
  }

  handleHideFloatIcon() {
    let { sdk_type } = this;
    if (sdk_type === 'web') { 
      store.dispatch(UIAction.setShowFloatIcon(false));
    }
    else if (sdk_type === 'native') {
      window.webkit.messageHandlers.iOS.postMessage({
          functionName: "hideAssistiveTouch"
      });
    }
  }

  render() {
    if (!this.state.showGame) {
      return (
        <div />
      );
    }
    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );
  }
}

export default App;



// WEBPACK FOOTER //
// ./src/App.js