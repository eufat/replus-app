import axios from 'axios';

import {env} from './configs';
import {getCookie} from './utils';

export const createClient = (type, token) => {
    let baseURL = '';
    let headers = {};

    if (type === 'core') {
        baseURL = env.CORE_API;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'post') {
        baseURL = env.CORE_POST;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'ir') {
        baseURL = env.CORE_IR;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'schedule') {
        baseURL = env.CORE_SCHEDULE;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'activity') {
        baseURL = env.CORE_ACTIVITY;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (type === 'vision') {
        baseURL = env.VISION_API;
        headers['Content-Type'] = 'application/json';
    }

    if (type === 'map') {
        baseURL = env.GOOGLE_MAPS;
    }

    if (token) {
        headers['accesstoken'] = token;
    }

    const config = {
        baseURL,
        headers,
    };

    return axios.create(config);
};

// Create specific clients with token provided from cookie
export const coreClient = () => {
    const accessToken = getCookie('accessToken');
    return createClient('core', accessToken);
};

export const corePost = () => {
    const accessToken = getCookie('accessToken');
    return createClient('post', accessToken);
};

export const coreIR = () => {
    // const accessToken = getCookie('accessToken');
    return createClient('ir', '');
};

export const coreActivity = () => {
    const accessToken = getCookie('accessToken');
    return createClient('activity', accessToken);
};

export const coreSchedule = () => {
    const accessToken = getCookie('accessToken');
    return createClient('schedule', accessToken);
};

export const visionClient = () => {
    const accessToken = getCookie('accessToken');
    return createClient('core', accessToken);
};

export const googleMaps = () => {
    return createClient('map', '');
};
