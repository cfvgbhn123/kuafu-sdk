import ActionTypes from './ActionTypes';

const setShowLoginView = (show) => {
    return {
        type: ActionTypes.SHOW_LOGIN_VIEW,
        show: show
    }
}

const setShowLoginBg = (show) => {
    return {
        type: ActionTypes.SHOW_LOGIN_BG,
        show: show
    }
}

const setShowPayView = (show) => {
    return {
        type: ActionTypes.SHOW_PAY_VIEW,
        show: show
    }
}

const setShowGame = (show) => {
    return {
        type: ActionTypes.SHOW_GAME,
        show: show
    }
}

const setShowFloatIcon = (show) => {
    return {
        type: ActionTypes.SHOW_FLOAT_ICON,
        show: show
    }
}

const setShowUserProfile = (show) => {
    return {
        type: ActionTypes.SHOW_USER_PROFILE,
        show: show
    }
}

export default {
    setShowLoginView,
    setShowLoginBg,
    setShowPayView,
    setShowGame,
    setShowFloatIcon,
    setShowUserProfile
}


// WEBPACK FOOTER //
// ./src/store/actions/UI.js