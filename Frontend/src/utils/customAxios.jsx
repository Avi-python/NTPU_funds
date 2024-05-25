import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import dayjs from 'dayjs';

const baseURL = process.env.REACT_APP_SERVER_URL;

const customAxios = () => {
    const axiosInstance = axios.create({
        baseURL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authTokenAccess')}`, // 這個只會在創建的時候被執行一次，因此如果 token 過期了，這個就會一直是過期的 token
        },
    });

    axiosInstance.interceptors.request.use(async req => {

        // console.log('in interceptors access token: ', localStorage.getItem('authTokenAccess'));
        // console.log('in interceptors refresh token: ', localStorage.getItem('authTokenRefresh'));

        if(localStorage.getItem('authTokenAccess') === null) {
            return req;
        }
        const payload = jwtDecode(String(localStorage.getItem('authTokenAccess')));
        // const isExpired = dayjs.unix(payload.exp).diff(dayjs()) < 1; 
        // This checks if the difference is less than 1 millisecond.

        const isExpired = dayjs.unix(payload.exp).diff(dayjs()) < 1;

        console.log('access token isExpired: ', isExpired);
        // payload.exp 的部分是 jwt的過期時間，如果這個過期時間超過了當前時間 dayjs 就會傳 true 代表 token 已經失效
        if (!isExpired) {
            req.headers.Authorization = `Bearer ${localStorage.getItem('authTokenAccess')}`; // 如果不加這個，就會一直使用上面過期的 token
            return req;
        } else {
            await axios({
                method: 'post',
                url: `${baseURL}/auth/token/refresh/`,
                data: {
                    refresh: localStorage.getItem('authTokenRefresh')
                },
            })
                .then(res => {
                    localStorage.setItem('authTokenAccess', res.data["access"]);
                    localStorage.setItem('authTokenRefresh', res.data["refresh"]);
                })
                .catch(err => {
                    console.log("reset access token error: ", err);
                });

            req.headers.Authorization = `Bearer ${localStorage.getItem('authTokenAccess')}`;
            return req;
        }
    });

    return axiosInstance;
}

export default customAxios;