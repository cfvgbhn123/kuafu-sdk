import ActionTypes from './ActionTypes';

const setPayInfo = (info) => {
    return {
        type: ActionTypes.PAY_INFO,
        info: info
    }
}

export default {
    setPayInfo
}


// WEBPACK FOOTER //
// ./src/store/actions/Pay.js