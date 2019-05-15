import React from 'react';
import { connect } from 'react-redux';
import PubSub from 'pubsub-js'; 
import LoginView from './login/LoginView';
import PayView from './pay/PayView';
import FloatView from './users/FloatView';
import UserProfile from './users/UserProfile';
import { Events } from '../utils/config';
import { UIAction } from '../store/actions';
import { Button } from 'antd-mobile';
import JsonRequestHelper from '../services';

class Container extends React.Component {
    state = {
        noticeType: 1,
        url: ''
    }

    componentWillMount() {
        // 游戏公告
        JsonRequestHelper.get('api/notice',{},(data) => {
            if (data.url) {
                this.setState({ noticeType: data.type, url: data.url });
            }
            else {
                this.showGame(true);
            }
        }, (error) => {
            this.showGame(true);
        });
    }

    componentDidMount() {
        this.pubsub_login = PubSub.subscribe(Events.LOGIN_SUCCESS,(message, data) => {
            this.props.dispatch(UIAction.setShowLoginBg(false));
            this.iframe.contentWindow.postMessage({action: message, data: data, isKFGame: true}, '*');
        });
        this.pubsub_logout = PubSub.subscribe(Events.LOGOUT_SUCCESS,(message, data) => {
            this.iframe.contentWindow.postMessage({action: message, data: data, isKFGame: true}, '*');
        });
        this.pubsub_pay = PubSub.subscribe(Events.EVENT_PAY,(message, data) => {
            this.iframe.contentWindow.postMessage({action: message, data: data, isKFGame: true}, '*');
        });
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.pubsub_login); 
        PubSub.unsubscribe(this.pubsub_logout); 
        PubSub.unsubscribe(this.pubsub_pay); 
    }

    showGame(show) {
        this.setState({
            ...this.state,
            url: show ? global.h5_sdk.gameUrl : this.state.url
        }, () => {
            this.props.dispatch(UIAction.setShowGame(show));
        });
    }

    noticeClose() {
        this.showGame(true);
    }

    onFloatIconClick() {        
        window.history.pushState(null, null, `${window.location.search}&page=user`);  
    }

    renderNoticeButton(type) {
        if (type === 2) {
            return <div style={{
                position: 'absolute',
                left: 12,
                right: 12,
                bottom: 20,
                display: 'flex',
            }}>
                <Button 
                    style={{flex: 1, marginRight: 12}} 
                    type="primary" 
                    inline
                    onClick={this.noticeClose.bind(this)}>
                    允许
                </Button>
                <Button 
                    style={{flex: 1, marginLeft: 12}} 
                    inline
                    onClick={() => this.setState({ ...this.state, url: '' })}>
                    退出
                </Button>
            </div>;
        }
        else {
            return <Button 
                type="primary"
                style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 20
                }}
                onClick={this.noticeClose.bind(this)} 
            >关闭</Button>;
        }
    }

    render() {
        let { ui } = this.props;        
        return (
            <div className="container-div">
                <div className={`iframe-box ${ui.showGame  ? 'iframe-unable-scroll' : 'iframe-scroll'}`}>
                    {this.state.url && (
                        <iframe 
                            ref={e => this.iframe = e} 
                            title=' ' 
                            src={this.state.url} 
                            frameBorder={0}
                        />
                    )}
                </div>
                {!ui.showGame && this.state.url && this.renderNoticeButton(this.state.noticeType)}
                {ui.showLoginBg && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent:'center', 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'black',
                        overflow: 'hidden'
                    }}>
                        <img alt="" style={{ maxWidth: '100%' }} src={window.h5_sdk.loginBg} />
                    </div>
                )}
                <LoginView
                    show={ui.showLogin}
                    onClose={() => this.props.dispatch(UIAction.setShowLoginView(false))}
                />
                <PayView 
                    show={ui.showPay}
                    onClose={() => {
                        this.props.dispatch(UIAction.setShowFloatIcon(true));                        
                        this.props.dispatch(UIAction.setShowPayView(false));
                    }}
                />
                <UserProfile 
                    show={ui.showUser}
                    onClose={() => {
                        this.props.dispatch(UIAction.setShowFloatIcon(true)); 
                        this.props.dispatch(UIAction.setShowUserProfile(false));
                    }}
                />
                <FloatView 
                    show={ui.showFloatIcon}
                    hide={() => this.props.dispatch(UIAction.setShowFloatIcon(false))} 
                    onClick={this.onFloatIconClick.bind(this)}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        ui: state.ui,
        currentUser: state.user.currentUser,
    };
}

export default connect(mapStateToProps)(Container);


// WEBPACK FOOTER //
// ./src/views/Container.js