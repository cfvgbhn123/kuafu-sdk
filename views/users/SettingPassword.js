import React from 'react';
import { connect } from 'react-redux';
import { NavBar, Icon, List, InputItem, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import Hud from '../../components/Hud';
import JsonRequestHelper from '../../services';
import './SettingPassword.css';

class SettingPassword extends React.Component {

    onBack() {
        this.props.onClose && this.props.onClose();
    }

    onSubmit() {
        let originalPwd = this.props.form.getFieldValue('originalPwd');
        let newPwd = this.props.form.getFieldValue('newPwd');
        let verifyPwd = this.props.form.getFieldValue('verifyPwd');
        
        if (!originalPwd) {
            Hud.showMessage("请输入原密码");
            return;
        }
        if (!newPwd || !verifyPwd) {
            Hud.showMessage("请输入新密码");
            return;
        }
        if (newPwd !== verifyPwd) {
            Hud.showMessage("两次输入的密码不一致");
            return;
        }
        if (originalPwd.indexOf(" ") !== -1 || newPwd.indexOf(" ") !== -1 || verifyPwd.indexOf(" ") !== -1) {
            Hud.showMessage("密码不能使用特殊符号");
            return;
        }
        Hud.showLoading();
        let params = {
            old_password: originalPwd,
            new_password: newPwd
        }
        JsonRequestHelper.post('api/user/password', params, () => {
            Hud.showMessage('修改密码成功');
            this.onBack();
        });
        console.log(originalPwd, newPwd, verifyPwd);
    }

    render() {
        const { getFieldProps } = this.props.form;

        return (
            <div className="container">
                <NavBar
                    mode="dark"
                    icon={<Icon type="left" color="white" onClick={this.onBack.bind(this)} />}
                >修改密码</NavBar>
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
                            {...getFieldProps('originalPwd')}
                            clear
                            placeholder="请输入原密码"
                            type="password"
                        >原密码
                        </InputItem>
                        <InputItem 
                            {...getFieldProps('newPwd')} 
                            clear
                            placeholder="请输入新密码" 
                            type="password"
                        >新密码
                        </InputItem>
                        <InputItem 
                            {...getFieldProps('verifyPwd')} 
                            clear
                            placeholder="验证新密码" 
                            type="password"
                        >新密码
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

export default connect(mapStateToProps)(createForm()(SettingPassword));



// WEBPACK FOOTER //
// ./src/views/users/SettingPassword.js