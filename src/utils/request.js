import axios from "axios";
//响应拦截器即异常处理
axios.interceptors.response.use(
    (response) => {
        return Promise.resolve(response.data);
    },
    (err) => {
        return Promise.reject(err.response);
    }
);
export default {
    get(url, param) {
        return axios({
            method: "get",
            url,
            params: param || {},
        });
    },
    //post请求
    // post(url, param, header, domainKey = "gameurl") {
    //     url = switchUrl(url, domainKey);
    //     return axios({
    //         method: "post",
    //         url,
    //         headers: {
    //             ...(header || {}),
    //             accessToken: store.state.user.token,
    //         },
    //         data: param || {},
    //     });
    // }
};
