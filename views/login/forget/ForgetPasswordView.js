import React from 'react';
import { Icon, Button } from 'antd-mobile';
import Utils from '../../../utils'
import Hud from '../../../components/Hud';
import JsonRequestHelper from '../../../services';
import './ForgetPasswordView.css';

class ForgetPasswordView extends React.Component {
    taskId = '';
    state = {
        timerCount: '获取验证码',
        disabled: false
    }

    onSmsClick() {
        if (this.state.disabled) return;

        let phone = this.phoneInput.value;
        if (!Utils.checkPhone(phone)) {
            Hud.showMessage("请输入有效手机号");
            return;
        }
        JsonRequestHelper.post('api/sms',{
            phone: phone,
            type: 2
        },(data) => {
            this.taskId = data.task_id;
            let timerCount = 60;
            let timer = setInterval(() => {
                if (timerCount <= 0) {
                    clearInterval(timer);
                    this.setState({timerCount: '获取验证码', disabled: false});
                } 
                else {
                    this.setState({timerCount: `${timerCount}秒`, disabled: true});
                }
                timerCount--;
            },1000);
        });
    }

    onConfirmClick() {
        let phone = this.phoneInput.value;
        let sms = this.smsInput.value;
        let newPwd = this.passwordInput.value;

        if (!Utils.checkPhone(phone)) {
            Hud.showMessage("请输入有效手机号");
            return;
        }
        if (!sms.length) {
            Hud.showMessage("请输入验证码");
            return;   
        }
        if (!newPwd.length) {
            Hud.showMessage("请输入新的密码");
            return;   
        }
        JsonRequestHelper.post('api/resetPassword',{
            task_id: this.taskId,
            password: newPwd,
            verify_code: sms
        },(data) => {            
            Hud.showMessage("修改密码成功");
            this.onClose();
        });
    }

    onClose() {
        this.props.onClose();
        this.phoneInput.value = '';
        this.smsInput.value = '';
        this.passwordInput.value = '';
    }

    render() {
        return (
            <div style={{flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                <Icon style={{ position: 'absolute', top: 0, left: 0 }} type='left' size='lg' onClick={this.onClose.bind(this)} />
                <input
                    ref={e => this.phoneInput = e} 
                    type="text" 
                    className={`custom-input phone`}
                    placeholder="请输入手机号码" 
                />
                <div className="sms-box">
                    <input
                        ref={e => this.smsInput = e}
                        type="text" 
                        className="custom-input" 
                        placeholder="请输入验证码" 
                    />
                    <p 
                        style={{color: this.state.disabled ? '#999999' : '#d5370f', width: 80}}
                        className="sms-btn" 
                        onClick={this.onSmsClick.bind(this)}
                    >{this.state.timerCount}</p>
                </div>
                <input
                    ref={e => this.passwordInput = e} 
                    type="text" 
                    className="custom-input" 
                    placeholder="请输入新密码" 
                />
                <Button
                    type='primary'
                    style={{
                        marginTop: 10,
                    }}
                    onClick={this.onConfirmClick.bind(this)}
                >确认修改</Button>
            </div>
        );
    }
}

export default ForgetPasswordView;


// WEBPACK FOOTER //
// ./src/views/login/forget/ForgetPasswordView.js