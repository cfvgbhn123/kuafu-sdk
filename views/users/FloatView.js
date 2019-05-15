import React from 'react';
import { connect } from 'react-redux';
import { UIAction } from '../../store/actions';
import './FloatView.css';

let iconH = 50;
let iconW = 50;
let windowW = document.documentElement.clientWidth;
let windowH = document.documentElement.clientHeight;
let offsetX = 0;
let offsetY = 0;
let touchW, touchH;
let dragView = null;

class FloatView extends React.PureComponent {
    state = {
        isDragging: false,
        targetX: windowW-iconW*0.5,
        targetY: 120,
    }

    isClick = true;

    componentWillMount() {
        windowW = document.documentElement.clientWidth;
        windowH = document.documentElement.clientHeight;
    }

    componentDidMount() {        
        dragView = this.refs['dragElem'];
        this.listenGesture(dragView);                
    }

    listenGesture(dragView) {
        // 移动端
        dragView.addEventListener("touchstart", (e) => {
            windowW = document.documentElement.clientWidth;
            windowH = document.documentElement.clientHeight;
            this.beginDrag(e);
            dragView.addEventListener("touchmove", this.dragging.bind(this), false);
            dragView.addEventListener("touchend", (e) => {                
                dragView.removeEventListener("touchmove", this.dragging, false);
                if (!this.isClick) {
                    this.endDrag(e);
                }
            }, false);
        }, false);

        global.addEventListener('onorientationchange' in global ? 'orientationchange' : 'resize', this.onScreenOrientationChange.bind(this), false);  
    }

    onScreenOrientationChange() {
        let left = Math.abs(dragView.offsetLeft + iconW*0.5);
        let right = Math.abs(windowW - left);
        let targetX;
        if (global.orientation === 90 || global.orientation === -90) { //lapdscape
            if (left < right) {
                targetX = -iconW*0.5;
            }
            else {
                targetX = windowW - iconW*0.5;
            }
            this.setState({ ...this.state, targetX: targetX });
        } 
    }

    beginDrag(e) {
        this.setState({ ...this.state, isDragging: true });
        (e.touches) && (e = e.touches[0]);
        touchW = e.clientX - dragView.offsetLeft;
        touchH = e.clientY - dragView.offsetTop;
    }

    dragging(e) {
        this.isClick = false;
        (e.touches) && (e = e.touches[0]);
        offsetX = e.clientX - touchW;
        offsetY = e.clientY - touchH;
        
        if(offsetX < 0) {
            offsetX = 0;
        } else if (offsetX > windowW - iconW) {
            offsetX = (windowW - iconW);
        }
        if(offsetY < 0) {
            offsetY = 0;
        } else if (offsetY > windowH - iconH) {
            offsetY = (windowH - iconH);
        }

        this.setState({
            ...this.state,
            targetX: offsetX,
            targetY: offsetY
        });
    }

    endDrag(e) {
        let direction = this.getDirection(offsetX, offsetY);
        let centerPoint = iconW * 0.5;      
        let targetX = 0;
        let targetY = offsetY;
        if (direction === 'left') {
            targetX = -centerPoint;
        }
        else if (direction === 'right') {
            targetX = windowW - centerPoint;
        }
        else {
            targetX = (offsetX + centerPoint) > windowW*0.5 ? windowW - centerPoint : -centerPoint;            
        }        
        this.setState({
            ...this.state,
            isDragging: false,
            targetX: targetX,
            targetY: targetY
        });
    }

    getDirection(offsetX, offsetY) {
        let top = Math.abs(offsetY + iconW*0.5);
        let left = Math.abs(offsetX + iconH*0.5);
        let right = Math.abs(windowW - left);
        let bottom = Math.abs(windowH - top);        
        let minSpace = 0;
        let direction = '';
        minSpace = Math.min(Math.min(Math.min(top, left), bottom), right);
        if (minSpace === left) {
            direction = 'left';
        } else if (minSpace === right) {
            direction = 'right';
        } else if (minSpace === top) {
            direction = 'top';
        } else {
            direction = 'bottom';
        }
        return direction;
    }

    onIconClick() {
        this.isClick = true;
        this.props.hide && this.props.hide();
        this.props.dispatch(UIAction.setShowUserProfile(true));
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    render() {
        let { show, currentUser } = this.props;        
        return (
            <div style={{
                zIndex: 99,
                display: (show && currentUser) ? 'inline' : 'none',
                position: 'fixed',
                top: this.state.targetY,
                left: this.state.targetX,
                width: iconW,
                height: iconH,
                borderRadius: iconW*0.5,
                transition: this.state.isDragging ? '0s' : '0.5s',
                backgroundImage: `url(icon_user.png)`,
                backgroundSize: '100% auto'
            }}
            ref="dragElem"
            onClick={this.onIconClick.bind(this)}
            >
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.user.currentUser,
    };
}

export default connect(mapStateToProps)(FloatView);


// WEBPACK FOOTER //
// ./src/views/users/FloatView.js