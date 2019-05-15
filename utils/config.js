// const BASE_URL = "http://dev.kuafugame.com:2333/";
// const BASE_URL = "http://k8s.client.kuafugame.com/";

// 线上
const BASE_URL = "https://p.kuafugame.com/";

const Events = {
    LOGIN_SUCCESS: 'loginSuccess',
    LOGOUT_SUCCESS: "logoutSuccess",
    EVENT_PAY: "pay",
}

module.exports = {
    BASE_URL,
    Events
}


// WEBPACK FOOTER //
// ./src/utils/config.js