import React from 'react';
import {
    Modal,
    List,
    Icon,
    Radio,
    Button,
    WingBlank,
} from 'antd-mobile';
import { connect } from 'react-redux';
import PubSub from 'pubsub-js'; 
import JsonRequestHelper from '../../services';
import Hud from '../../components/Hud';
import { BASE_URL, Events } from '../../utils/config';
import { PayAction } from '../../store/actions'
import Utils from '../../utils';
import './PayView.css';

const RadioItem = Radio.RadioItem;
const alert = Modal.alert;

class PayView extends React.Component {
    state = {
        channel: 'wechat',
        showAlipayIframe: false,
    }

    onPayClick() {
        let { payInfo } = this.props;
        let payParams = {
            cp_order_id: payInfo.order_id,         
            amount: payInfo.pay_price,
            product_id: payInfo.product_id,
            product_name: payInfo.product_name,
            server_id: payInfo.server_id,
            role_id: payInfo.role_id,
            server_name: payInfo.server_name,
            role_name: payInfo.role_name,
            notify_url: payInfo.notify_url,
            ext: payInfo.ext,
            payment_channel: this.state.channel === 'wechat' ? 2 : 3
        }        
        Hud.showLoading();
        JsonRequestHelper.post('api/order/makeCommonOrder',payParams,(data) => {
            Hud.hideLoading();
            if (this.state.channel === 'wechat') {
                this.payByWechat(data);
            }
            else {
                this.payByAlipay(data);
            }
            alert('是否完成支付', '', [
                { text: '再想想', style: 'default'},
                { text: '已支付', onPress: () => this.checkOrder(data) },
            ]);
        });
    }

    checkOrder(data) {
        let params = Utils.parseQueryString(`${BASE_URL}?${data.param}&pay_request_type=H5_NOW_PAY`);  
        Hud.showLoading();       
        JsonRequestHelper.post('api/order/find',{
            order_id: params.order_id
        },(data) => {
            // 查询订单支付结果
            if (data.status === 2) {
                Hud.showMessage('支付成功');
                PubSub.publish(Events.EVENT_PAY, JSON.stringify({code: 1, msg: "支付成功"}));
            }
            else {
                Hud.showMessage('支付失败');
                PubSub.publish(Events.EVENT_PAY, JSON.stringify({code: 0, msg: "支付失败"}));
            }
            this.onPayClose();
        });
    }

    payByAlipay(data) {
        if (window.webkit) { // iOS webView
            this.setState({
                ...this.state,
                showAlipayIframe: true
            },() => {
                this.alipayIframe.src = `${BASE_URL}api/pay/wapPay?${data.param}`;
            });
        }
        else {
            let params = Utils.parseQueryString(`${BASE_URL}?${data.param}&request_client_type=1`);
            delete params.sign;
            let alipayParams = JsonRequestHelper.paramsSigned(params);
            window.open(`${BASE_URL}api/pay/wapPay?${Utils.queryString(alipayParams)}`);
        }
    }

    payByWechat(data) {
        let params = Utils.parseQueryString(`${BASE_URL}?${data.param}&pay_request_type=H5_NOW_PAY`);            
        delete params.sign;        
        JsonRequestHelper.get(`api/pay/nowPay`,params,(data) => {
            Hud.hideLoading();
            window.location.href = data.url;
        });
    }

    onAlipayClose() {
        this.setState({
            ...this.state,
            showAlipayIframe: false
        });
    }

    onPayClose() {
        // 重置默认值
        this.setState({
            channel: 'wechat', 
            showAlipayIframe: false
        }, () => {
            this.props.onClose && this.props.onClose();
            this.props.dispatch(PayAction.setPayInfo(null));
        });
    }

    render() {
        let { payInfo } = this.props;

        return (
            <div 
                className="pay-view" 
                style={{
                    display: this.props.show ? 'inline' : 'none',
                    position: 'absolute', 
                    top: 0,
                    left: this.props.show ? 0 : window.innerWidth, 
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'white', 
                }}
            >
                {!this.state.showAlipayIframe && (
                    <div>
                        <Icon style={{ position: 'absolute', top: 0, left: 0, height: 44 }} type='left' size='lg' onClick={this.onPayClose.bind(this)} />
                        <div style={{backgroundColor: '#e2e2e2', position: 'absolute', top: 44, left: 0, right: 0, height: 1}} />
                        <p className="price-text">￥{payInfo && payInfo.pay_price / 100}</p>
                        <List style={{backgroundColor: '#f8f8f8'}} renderHeader={() => '选择支付方式'} className="pay-list">
                            <RadioItem
                                style={{height:50}}
                                thumb={(<img alt="" src='icon_wechat.png' />)}
                                checked={this.state.channel === 'wechat'}   
                                onClick={() => this.setState({...this.state, channel: 'wechat'})}
                            >
                            微信支付
                            </RadioItem>
                            <RadioItem
                                style={{height:50, textAlign: 'center'}}
                                thumb={(<img alt="" src='icon_alipay.png' />)}
                                checked={this.state.channel === 'alipay'}
                                onClick={() => this.setState({...this.state, channel: 'alipay'})}
                            >
                            支付宝支付
                            </RadioItem>
                        </List>
                        <WingBlank size="lg">
                            <Button
                                type='primary'
                                style={{
                                    marginTop: 20,
                                }}
                                onClick={this.onPayClick.bind(this)}
                            >
                                确认支付
                            </Button>
                        </WingBlank>
                    </div>
                 )} 
                {this.state.showAlipayIframe && (
                    <div className="alipay-view">
                        <iframe 
                            ref={e => this.alipayIframe = e} 
                            title='支付'
                            width={window.innerWidth} 
                            height={window.innerHeight}  
                            scrolling='no' 
                            frameBorder='0' 
                        />
                        <div className="back-view" onClick={this.onAlipayClose.bind(this)}>
                            <p style={{color: 'white'}} >返回游戏</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        payInfo: state.pay.payInfo
    };
}

export default connect(mapStateToProps)(PayView);


// WEBPACK FOOTER //
// ./src/views/pay/PayView.js