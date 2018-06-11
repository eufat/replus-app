import {env} from './configs';

export const createClient = (type, token) => {
    let baseURL = '';
    let headers = {};

    if (type === 'core') {
        baseURL = env.CORE_API;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'vision') {
        baseURL = env.VISION_API;
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['accessToken'] = token;
    }

    return axios.create({
        baseURL,
        headers,
    });
};
