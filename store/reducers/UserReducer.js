import ActionTypes from '../actions/ActionTypes';

export default (state={ accountList: [] }, action) => {
	switch(action.type) {
        case ActionTypes.SET_CURRENT_USER:
            if (window.localStorage) {
                localStorage.setItem("currentUser",JSON.stringify(action.user));
            }
            return Object.assign({}, state, { currentUser: action.user });
        case ActionTypes.UNSET_CURRENT_USER:
            if (window.localStorage) {
                localStorage.removeItem("currentUser");
            }
            return Object.assign({}, state, { currentUser: null });
        case ActionTypes.USER_ACCOUNT_LIST:
            if (window.localStorage) {
                localStorage.setItem("accountList",JSON.stringify(action.list));            
            }
            return Object.assign({}, state, { accountList: action.list });
		default:
			return state;
	}
}



// WEBPACK FOOTER //
// ./src/store/reducers/UserReducer.js