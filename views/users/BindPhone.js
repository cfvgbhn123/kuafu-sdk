import React from 'react';
import { connect } from 'react-redux';
import { NavBar, Icon, List, InputItem, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import { UserAction } from '../../store/actions';
import Hud from '../../components/Hud';
import Utils from '../../utils';
import JsonRequestHelper from '../../services';
import './BindPhone.css';

class BindPhone extends React.Component {
    taskId = '';
    state = {
        phone: '',
        timerCount: '获取验证码',
        disabled: false,
        isBind: (this.props.currentUser && this.props.currentUser.phone) ? false : true
    }

    componentDidMount() {
        if (this.props.currentUser.phone) {
            this.setState({ ...this.state, phone: this.props.currentUser.phone });
        }
    }

    getSmsCode() {
        let { isBind } = this.state;
        let phone = this.state.phone.replace(/\s/g, '');
        if (!Utils.checkPhone(phone)) {
            Hud.showMessage("请输入有效手机号");
            return;
        }
        JsonRequestHelper.post('api/sms',{
            phone: phone,
            type: isBind ? 8 : 9
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

    onSubmit() {
        let phone = this.state.phone.replace(/\s/g, '');
        let smsCode = this.props.form.getFieldValue('smsCode');
        if (!Utils.checkPhone(phone)) {
            Hud.showMessage("请输入有效手机号");
            return;
        }
        if (!smsCode) {
            Hud.showMessage("请输入验证码");
            return;
        }
        if (!this.taskId) {
            Hud.showMessage("验证失败");
            return;
        }
        Hud.showLoading();
        let { isBind } = this.state;
        let url = isBind ? 'api/user/bindPhone' : 'api/user/unbindPhone';
        JsonRequestHelper.post(url,{
            task_id: this.taskId,
            verify_code: smsCode
        },(data) => {            
            Hud.showMessage(isBind ? "绑定手机成功" : "解绑成功");
            let user = {
                ...this.props.currentUser,
                phone: isBind ? phone : '',
            }
            this.props.dispatch(UserAction.setCurrentUser(user));
            this.onBack();
        });
    }

    onBack() {
        this.props.onClose && this.props.onClose();
    }

    render() {
        const { getFieldProps } = this.props.form;

        return (
            <div className="container">
                <NavBar
                    mode="dark"
                    icon={<Icon type="left" color="white" onClick={this.onBack.bind(this)} />}
                >{this.state.isBind ? "绑定手机" : "解绑手机"}</NavBar>
                <form>
                    <List
                        renderHeader={() => `游戏账号：${this.props.currentUser && this.props.currentUser.username}`}
                        renderFooter={() => 
                            <Button type="primary" size="ghost" style={{ marginTop: 44 }} onClick={this.onSubmit.bind(this)}>
                                提交
                            </Button>
                        }
                    >
                        <InputItem
                            {...getFieldProps('phone')}
                            clear
                            placeholder="请输入手机号"
                            type="phone"
                            value={this.state.phone}
                            onChange={(value) => this.setState({ ...this.state, phone: value })}
                            disabled={this.state.isBind ? false : true}
                        >手机号
                        </InputItem>
                        <InputItem
                            {...getFieldProps('smsCode')}
                            clear
                            placeholder="请输入验证码"
                            type="number"
                        >验证码
                            <div className="sms-btn-box">
                                <Button 
                                    size="small" 
                                    disabled={this.state.disabled}
                                    onClick={this.getSmsCode.bind(this)}
                                >
                                    {this.state.timerCount}
                                </Button>
                            </div>
                        </InputItem>
                    </List>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.user.currentUser,
    };
}

export default connect(mapStateToProps)(createForm()(BindPhone));



// WEBPACK FOOTER //
// ./src/views/users/BindPhone.js