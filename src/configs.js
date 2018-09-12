const prod = true; // process.env.NODE_ENV === 'production';
const version = '2.0.0-alpha.1';

const mapsApi = 'AIzaSyCfGVFRrYf89QiMaQCiXUb-D_uDjUPCsCc';
const mapsURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${mapsApi}`;
const projectId = 'replus-162509';
const stackdriverError = 'AIzaSyBNs1144i3uKRPvqsXlrrAi4hKrijWrqLE';

const prodFirebase = {
    apiKey: 'AIzaSyAunkgswJoWW_cN8iF5SWDXKfEm07scMuo',
    authDomain: 'mqtt-remote.firebaseapp.com',
    databaseURL: 'https://mqtt-remote.firebaseio.com',
    projectId: 'mqtt-remote',
    storageBucket: 'mqtt-remote.appspot.com',
    messagingSenderId: '369821906057',
};

const devFirebase = {
    apiKey: 'AIzaSyDGCQ24hjwEeQwlus_Knet1_Lnx93Lyy2g',
    authDomain: 'replus-162509.firebaseapp.com',
    databaseURL: 'https://replus-162509.firebaseio.com',
    projectId: 'replus-162509',
    storageBucket: 'replus-162509.appspot.com',
    messagingSenderId: '169133229879',
};

const prodEndpoint = {
    CORE_IR: 'https://core.replus.co/ir/',
    CORE_API: 'https://core.replus.co/api-v2',
    CORE_POST: 'https://core.replus.co/post-v2',
    CORE_SCHEDULE: 'https://core.replus.co/schedule-v2',
    CORE_ACTIVITY: 'https://core.replus.co',
    CORE_GEOSENSE: 'https://core.replus.co/geosense',
    CORE_FORECAST: 'https://core.replus.co/forecast',
    VISION_API: 'https://vision.replus.co/api',
    VISION_ACTIVITY: 'https://vision.replus.co/activity',
    VISION_STREAM: 'https://vision.replus.co/stream',
};

const devEndpoint = {
    CORE_IR: 'https://core.replus.co/ir/',
    CORE_API: 'http://localhost:2000/api',
    CORE_POST: 'http://localhost:2010/post',
    CORE_SCHEDULE: 'http://localhost:2020/schedule',
    CORE_ACTIVITY: 'http://localhost:2030/',
    CORE_GEOSENSE: 'http://localhost:2040/geosense',
    CORE_FORECAST: 'http://localhost:2050/forecast',
    VISION_API: 'http://localhost:5000/api',
    VISION_ACTIVITY: 'ws://localhost:5010',
    VISION_STREAM: 'http://localhost:5020',
};

const prodEnv = {
    PRODUCTION: prod,
    VERSION: version,
    PROJECT_ENV: projectId,
    GOOGLE_MAPS: mapsURL,
    ERROR_KEY: stackdriverError,
    ...prodEndpoint,
};

const devEnv = {
    PRODUCTION: prod,
    VERSION: version,
    PROJECT_ENV: projectId,
    GOOGLE_MAPS: mapsURL,
    ERROR_KEY: stackdriverError,
    ...devEndpoint,
};

export const env = prod ? prodEnv : devEnv;
export const firebaseConfig = prod ? prodFirebase : devFirebase;
export const loadEnv = () => {
    window.process.env = env;
};
