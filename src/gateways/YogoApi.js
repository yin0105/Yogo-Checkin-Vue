import axios from 'axios';
import router from '../router'

let yogoApi = axios.create({
    baseURL: process.env.VUE_APP_API_ROOT
});

yogoApi.interceptors.response.use(function (response) {
    // Do something with response data
    return response.data;
}, function (error) {
    if (error.response.status === 403 && error.request.responseURL.indexOf('/login') === -1) {
        router.push({name: 'Login'});
    }
    return Promise.reject(error);
});

yogoApi.interceptors.request.use(function (config) {

    let headers = config.headers || {};

    if (config.url.indexOf('/login') > -1) {
        // Don't send access token to login
        if (headers.Authorization) delete headers.Authorization
    } else if (!headers.Authorization) {
        // Send access- token to all other routes, if available
        let accessToken = window.sessionStorage.getItem('accessToken')

        if (accessToken) {
            headers.Authorization = 'Bearer ' + accessToken
        }
    }

    headers['X-Yogo-Request-Context'] = 'checkin';

    const clientId = process.env.VUE_APP_CLIENT_ID
    if (clientId) {
        headers['X-Yogo-Client-ID'] = clientId
    }

    const regexResult = window.location.href.match(/clientId=(\d+)/)

    if (regexResult) {
        headers['X-Yogo-Client-ID'] = regexResult[1]
    }
    config.headers = headers;

    const urlHasSearchQuery = config.url.indexOf('?') > -1
    const timestampQueryParam = 'timestamp=' + Date.now()
    config.url += (urlHasSearchQuery ? '&' : '?') + timestampQueryParam

    return config

}, function(error) {
    console.log(error.message)
});

export default yogoApi
