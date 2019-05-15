import React from 'react';
import { connect } from 'react-redux';
import { NavBar, Icon, List, Button, Modal } from 'antd-mobile';
import PubSub from 'pubsub-js'; 
import { BASE_URL, Events } from '../../utils/config';
import Utils from '../../utils';
import { UIAction, UserAction } from '../../store/actions';
import CustomerServices from './CustomerServices';
import SettingPassword from './SettingPassword';
import BindPhone from './BindPhone';
import BindIdentityCard from './BindIdentityCard';
import JsonRequestHelper from '../../services';

const Item = List.Item;
const alert = Modal.alert;

class UserProfile extends React.Component {
    state = {
        showPage: false,
        page: null,
        serviceUrl: '',
    }

    componentDidMount() {
        // 监听浏览器返回事件
        window.addEventListener('popstate', (state) => {
            this.closePage();
            this.onBack();
        });    
    }

    componentWillUnmount() {
        window.removeEventListener('popstate');   
    }

    onBack() {
        this.props.onClose && this.props.onClose();
        // window.history.back(); 
    }

    onItemClick(page) {
        if (page === 'customerService') {
            let params = JsonRequestHelper.paramsSigned();
            let url = `${BASE_URL}api/user/customerService?${Utils.queryString(params)}`;
            this.setState({ ...this.state, page: page, serviceUrl: url, showPage: true });
            return;
        }

        this.setState({ ...this.state, page: page, showPage: true });
    }

    closePage() {
        this.setState({ ...this.state, page: null, showPage: false });
    }

    switchAccount() {
        alert('切换账号', '您确定要切换账号吗？', [
            { text: '切换账号', onPress: () => {
                this.props.dispatch(UIAction.setShowUserProfile(false));
                this.props.dispatch(UIAction.setShowFloatIcon(false));
                // 显示登录页 
                if (window.h5_sdk.loginBg) {
                    this.props.dispatch(UIAction.setShowLoginBg(true));
                }
                this.props.dispatch(UIAction.setShowLoginView(true));
                // 通知注销
                this.props.dispatch(UserAction.unsetCurrentUser());
                PubSub.publish(Events.LOGOUT_SUCCESS, JSON.stringify({code: "",msg: ""}));
            }},
            { text: '返回游戏'},
        ]);
    }

    renderPage() {
        let { page } = this.state;
        if (page === 'customerService') {
            return (
                <CustomerServices
                    url={this.state.serviceUrl} 
                    onClose={this.closePage.bind(this)}
                />
            );
        }
        else if (page === 'settingPassword') {
            return (
                <SettingPassword onClose={this.closePage.bind(this)} />
            );
        }
        else if (page === 'bindPhone') {
            return (
                <BindPhone onClose={this.closePage.bind(this)} />
            );
        }
        else if (page === 'bindIdentityCard') {
            return (
                <BindIdentityCard onClose={this.closePage.bind(this)} />
            );
        }
        return <div />;
    }

    renderFooter() {
        return (
            <Button 
                type="ghost" 
                style={{ marginTop: 44 }}
                onClick={this.switchAccount.bind(this)}
            >切换账号</Button>
        );
    }

    render() {        
        let { show } = this.props;
        return (
            <div style={{
                position: 'fixed', 
                display: show ? 'inline' : 'none',
                top: 0,
                left: show ? 0 : window.innerWidth, 
                right: 0,
                bottom: 0,
                transition: '0.4s',
                backgroundColor: 'white',
                overflow: 'auto'
            }}>
                <NavBar
                    mode="dark"
                    icon={<Icon type="left" color="white" onClick={this.onBack.bind(this)} />}
                >个人中心</NavBar>
                <List 
                    renderHeader={() => `游戏账号：${this.props.currentUser && this.props.currentUser.username}`}
                    renderFooter={this.renderFooter.bind(this)}
                >
                    <Item
                        arrow="horizontal"
                        onClick={() => this.onItemClick('customerService')}
                    >客服中心</Item>
                    <Item
                        arrow="horizontal"
                        onClick={() => this.onItemClick('settingPassword')}
                    >修改密码</Item>
                    <Item
                        arrow="horizontal"
                        extra={this.props.currentUser && this.props.currentUser.phone ? "已绑定" : "未绑定"}
                        onClick={() => this.onItemClick('bindPhone')}
                    >绑定手机</Item>
                    <Item
                        arrow="horizontal"
                        extra={this.props.currentUser && this.props.currentUser.id_match ? "已认证" : "未认证"}
                        onClick={() => this.onItemClick('bindIdentityCard')}
                    >实名认证</Item>
                </List>
                <div style={{
                    zIndex: 5,
                    display: 'flex',
                    position: 'fixed', 
                    top: 0,
                    left: this.state.showPage ? 0 : window.innerWidth, 
                    right: 0,
                    bottom: 0,
                    transition: '0.4s',
                    backgroundColor: 'white'
                }}>
                    {this.renderPage()}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.user.currentUser,
    };
}

export default connect(mapStateToProps)(UserProfile);


// WEBPACK FOOTER //
// ./src/views/users/UserProfile.js