import React from 'react';
import { Icon, Button } from 'antd-mobile';
import Hud from '../../../components/Hud';
import Utils from '../../../utils';
import JsonRequestHelper from '../../../services';
import './RegisterView.css';

class RegisterView extends React.Component {

    onRegisterClick() {
        let account = this.usernameInput.value;
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
        if (!Utils.checkEmoji(account) || !Utils.checkAccount(account)) {
            Hud.showMessage("账号格式有误");
            return;
        }
        Hud.showLoading();
        JsonRequestHelper.post('api/user/register',{
            username: account,
            password: pwd,
        },(data) => {
            this.props.registerCallback({...data, password: pwd});
            this.onClose();
        });
    }

    onQuickRegisterClick() {
        Hud.showLoading();
        JsonRequestHelper.get('api/user/randomName',{},(data) => {
            Hud.hideLoading();
            this.usernameInput.value = data.name;
            this.passwordInput.value = data.password;
        });
    }

    onClose() {
        this.props.onClose();
        this.usernameInput.value = '';
        this.passwordInput.value = '';
    }

    render() {
        return (
            <div style={{flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                <Icon style={{ position: 'absolute', top: 0, left: 0 }} type='left' size='lg' onClick={this.onClose.bind(this)} />
                <input
                    ref={e => this.usernameInput = e}
                    type="text" 
                    className={`custom-input register-account`}
                    placeholder="6到20位字母, 数字, _ (不能纯数字)" 
                />
                <input
                    ref={e => this.passwordInput = e}
                    type="text" 
                    className="custom-input" 
                    placeholder="请输入您的密码" 
                />
                <Button
                    type='primary'
                    style={{
                        marginTop: 10,
                    }}
                    onClick={this.onRegisterClick.bind(this)}
                >确认注册</Button>
                <Button
                    style={{
                        marginTop: 5,
                    }}
                    onClick={this.onQuickRegisterClick.bind(this)}
                >一键注册</Button>
            </div>
        );
    }
}

export default RegisterView;


// WEBPACK FOOTER //
// ./src/views/login/register/RegisterView.js