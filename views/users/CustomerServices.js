import React from 'react';
import { NavBar, Icon } from 'antd-mobile';
import './CustomerServices.css';

class CustomerServices extends React.Component {
    state = {
        offsetX: this.props.show ? 0 : window.innerWidth
    }

    onBack() {
        this.props.onClose && this.props.onClose();
    }
 
    render() {
        return (
            <div className="container">
                <NavBar
                    mode="light"
                    icon={<Icon type="left" onClick={this.onBack.bind(this)} />} 
                ></NavBar>
                <div className="iframe-div">
                    <iframe 
                        style={{ width: '100%', height: '100%' }}
                        src={this.props.url}
                        title=' '
                        frameBorder='0' 
                        scrolling='yes'
                    />
                </div>
            </div>
        )
    }
}

export default CustomerServices;


// WEBPACK FOOTER //
// ./src/views/users/CustomerServices.js