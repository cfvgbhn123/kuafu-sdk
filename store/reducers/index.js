import { combineReducers } from 'redux';
import uiReducer from './UIReducer';
import userReducer from './UserReducer';
import payReducer from './PayReducer';

const reducer = combineReducers({
    ui: uiReducer,
    user: userReducer,
    pay: payReducer
});

export default reducer;


// WEBPACK FOOTER //
// ./src/store/reducers/index.js