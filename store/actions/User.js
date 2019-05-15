import ActionTypes from './ActionTypes';

const setCurrentUser = (user) => {
    return {
        type: ActionTypes.SET_CURRENT_USER,
        user: user
    }
}

const unsetCurrentUser = () => {
    return {
        type: ActionTypes.UNSET_CURRENT_USER,
    }
}
const setAccountList = (list) => {
    return {
        type: ActionTypes.USER_ACCOUNT_LIST,
        list: list
    }
}

export default {
    setCurrentUser,
    unsetCurrentUser,
    setAccountList
}


// WEBPACK FOOTER //
// ./src/store/actions/User.js