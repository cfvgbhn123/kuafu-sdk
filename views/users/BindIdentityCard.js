import React from 'react';
import { connect } from 'react-redux';
import { NavBar, Icon, List, InputItem, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import { UserAction } from '../../store/actions';
import Hud from '../../components/Hud';
import JsonRequestHelper from '../../services';
import './BindIdentityCard.css';

class BindIdentityCard extends React.Component {
    state = {
        isBind: this.props.currentUser && this.props.currentUser.id_match
    }

    onBack() {
        this.props.onClose && this.props.onClose();
    }

    onSubmit() {
        let name = this.props.form.getFieldValue('name');
        let idNumber = this.props.form.getFieldValue('idNumber');
        if (!name) {
            Hud.showMessage("请输入真实姓名");
            return;
        }
        if (!idNumber) {
            Hud.showMessage("请输入身份证号码");
            return;
        }
        Hud.showLoading();
        let params = {
            real_name: name,
            id_number: idNumber
        }
        JsonRequestHelper.post('api/user/update', params, () => {
            Hud.showMessage('实名认证成功');
            let user = {
                ...this.props.currentUser,
                id_match: 1,
                id_number: idNumber,
                real_name: name,
            }
            this.props.dispatch(UserAction.setCurrentUser(user));
            this.onBack();
        });
    }

    renderFooter() {
        if (this.state.isBind) {
            return <div />
        }
        return (
            <Button type="primary" size="ghost" style={{ marginTop: 44 }} onClick={this.onSubmit.bind(this)}>
            提交
            </Button>
        );
    }

    render() {
        const { getFieldProps } = this.props.form;
        let { isBind } = this.state;
        let { currentUser } = this.props;

        return (
            <div className="container">
                <NavBar
                    mode="dark"
                    icon={<Icon type="left" color="white" onClick={this.onBack.bind(this)} />}
                >实名认证</NavBar>
                <form>
                    <List
                        renderHeader={() => `游戏账号：${this.props.currentUser && this.props.currentUser.username}`}
                        renderFooter={this.renderFooter.bind(this)}
                    >
                        <InputItem
                            {...getFieldProps('name')}
                            clear
                            defaultValue={isBind ? currentUser.real_name : ''}
                            disabled={isBind}
                            placeholder="请输入您的姓名"
                        >真实姓名
                        </InputItem>
                        <InputItem 
                            {...getFieldProps('idNumber')}
                            clear
                            defaultValue={isBind ? currentUser.id_number : ''}
                            disabled={isBind}
                            placeholder="请输入您的身份证号码" 
                            type="number"
                        >身份证号
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

export default connect(mapStateToProps)(createForm()(BindIdentityCard));



// WEBPACK FOOTER //
// ./src/views/users/BindIdentityCard.js