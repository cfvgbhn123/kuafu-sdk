import { Toast } from 'antd-mobile';

export default class Hud {
    static showMessage(text) {
        Toast.info(text, 1);
    }

    static showLoading() {
        Toast.loading('请求数据中', 0);
    }

    static hideLoading() {
        Toast.hide();
    }
}





// WEBPACK FOOTER //
// ./src/components/Hud.js