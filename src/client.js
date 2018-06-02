import {env} from './configs';
export const coreClient = axios.create({
    baseURL: env.CORE_API,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const visionClient = axios.create({
    baseURL: env.VISION_API,
    headers: {'Content-Type': 'application/json'},
});
