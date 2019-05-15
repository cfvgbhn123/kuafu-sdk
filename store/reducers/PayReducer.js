import ActionTypes from '../actions/ActionTypes';

export default (state={}, action) => {
	switch(action.type) {
        case ActionTypes.PAY_INFO:
            return Object.assign({}, state, {payInfo: action.info});
		default:
			return state;
	}
}


// WEBPACK FOOTER //
// ./src/store/reducers/PayReducer.js