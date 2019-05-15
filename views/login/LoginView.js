import React from 'react';
import { Modal, Button } from 'antd-mobile';
import { connect } from 'react-redux';
import PubSub from 'pubsub-js'; 
import RegisterView from './register/RegisterView';
import ForgetPasswordView from './forget/ForgetPasswordView';
import JsonRequestHelper from '../../services';
import { Events } from '../../utils/config';
import Utils from '../../utils';
import Hud from '../../components/Hud';
import './LoginView.css';
import { UIAction, UserAction } from '../../store/actions';

class LoginView extends React.Component {
    state = {
        showRegister: false,
        showForgetPwd: false,
    }

    onRegisterClick() {
        this.setState({...this.state, showRegister: true});
    }

    onForgetPasswordClick() {
        this.setState({...this.state, showForgetPwd: true});
    }

    onLoginClick() {
        let account = this.accountInput.value;
        let pwd = this.passwordInput.value;

        if (account.length < 6 || account.length > 20) {
            Hud.showMessage("请输入6至20位的账号");
            return;
        }
        if (pwd.length < 6 || pwd.length > 20) {
            Hud.showMessage("请输入6至20位的密码");
            return;
        }
        if (pwd.indexOf(" ") !== -1) {
            Hud.showMessage("密码不能使用特殊符号");
            return;
        }
        if (!Utils.checkEmoji(account) || account.indexOf(" ") !== -1) {
            Hud.showMessage("账号格式有误");
            return;
        }

        Hud.showLoading();
        JsonRequestHelper.post('api/user/login',{
            username: account,
            password: pwd
        },(data) => {
            this.handleLoginSuccess({...data, password: pwd});
        });
    }

    handleLoginSuccess(data) {        
        Hud.showMessage("登录成功");        
        this.props.dispatch(UIAction.setShowLoginView(false));
        let accountArr = this.props.accountList.filter((item) => item.uid !== data.uid);            
        accountArr.unshift(data);
        this.props.dispatch(UserAction.setAccountList(accountArr));
        this.props.dispatch(UserAction.setCurrentUser(data)); 
        global.kfgame_info["showFloatIcon"] = data.flow;
        this.props.dispatch(UIAction.setShowFloatIcon(true));
        // 通知cp登录成功
        let info = {
            code: 1,
            msg: "",
            open_uid: data.open_uid,
            access_token: data.access_token
        }
        PubSub.publish(Events.LOGIN_SUCCESS, JSON.stringify(info));
    }

    render() {
        let viewStyle = {
            display: 'flex', 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bottom: 0, 
            transition: '0.5s', 
            backgroundColor: 'white'
        };

        let { accountList } = this.props;
        return (
            <Modal
                visible={this.props.show}
                transparent={true}
                maskClosable={false}
                onClose={() => this.props.onClose && this.props.onClose()}
            >
                <div className="container">
                    <input ref={e => this.accountInput = e} defaultValue={accountList.length ? accountList[0].username : ''} type="text" className={`custom-input account`} placeholder="请输入账号" />
                    <input ref={e => this.passwordInput = e} defaultValue={accountList.length ? accountList[0].password : ''} type="password" className="custom-input" placeholder="请输入密码" />
                    <Button
                        type='primary'
                        style={{
                            marginTop: 15,
                        }}
                        onClick={this.onLoginClick.bind(this)}
                    >登录游戏</Button>
                    <span className="bottom-box">
                        <p style={{ marginRight: 90 }} onClick={this.onForgetPasswordClick.bind(this)}>忘记密码</p>
                        <p onClick={this.onRegisterClick.bind(this)}>立即注册</p>
                    </span>
                    <div className="register-view" style={{ ...viewStyle, left: this.state.showRegister ? 0 : 400 }}>
                        <RegisterView 
                            onClose={() => {this.setState({...this.state, showRegister: false})}}
                            registerCallback={this.handleLoginSuccess.bind(this)} 
                        />
                    </div>
                    <div className="forget-view" style={{ ...viewStyle, left: this.state.showForgetPwd ? 0 : 400 }}>
                        <ForgetPasswordView onClose={() => {this.setState({...this.state, showForgetPwd: false})}} />
                    </div>
                </div>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.user.currentUser,
        accountList: state.user.accountList,
    };
}

export default connect(mapStateToProps)(LoginView);



// WEBPACK FOOTER //
// ./src/views/login/LoginView.js