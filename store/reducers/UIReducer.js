import ActionTypes from '../actions/ActionTypes';

export default (state = {}, action) => {
	switch (action.type) {
		case ActionTypes.SHOW_LOGIN_VIEW:
			return Object.assign({}, state, { showLogin: action.show });
		case ActionTypes.SHOW_LOGIN_BG:
			return Object.assign({}, state, { showLoginBg: action.show });
		case ActionTypes.SHOW_PAY_VIEW:
			return Object.assign({}, state, { showPay: action.show });
		case ActionTypes.SHOW_GAME:
			return Object.assign({}, state, { showGame: action.show });
		case ActionTypes.SHOW_FLOAT_ICON:
			return Object.assign({}, state, { showFloatIcon: global.kfgame_info.showFloatIcon ? action.show : false });
		case ActionTypes.SHOW_USER_PROFILE:
			return Object.assign({}, state, { showUser: action.show });
		default:
			return state;
	}
}


// WEBPACK FOOTER //
// ./src/store/reducers/UIReducer.js