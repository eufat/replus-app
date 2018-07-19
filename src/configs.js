// const prod = process.env.NODE_ENV === 'production';
const prod = false;
const googleMapsApi = 'AIzaSyCfGVFRrYf89QiMaQCiXUb-D_uDjUPCsCc';

export const firebaseConfig = {
    apiKey: 'AIzaSyDGCQ24hjwEeQwlus_Knet1_Lnx93Lyy2g',
    authDomain: 'replus-162509.firebaseapp.com',
    databaseURL: 'https://replus-162509.firebaseio.com',
    projectId: 'replus-162509',
    storageBucket: 'replus-162509.appspot.com',
    messagingSenderId: '169133229879',
};

export const env = {
    CORE_API: prod ? 'https://core.replus.co/api' : 'http://localhost:7000/api',
    CORE_POST: 'https://core.replus.co/post',
    CORE_IR: 'https://core.replus.co/ir/',
    CORE_SCHEDULE: prod ? 'https://core.replus.co/schedule' : 'http://localhost:7000/schedule',
    CORE_ACTIVITY: prod ? 'https://core.replus.co/activity' : 'ws://localhost:7010',
    VISION_API: prod ? 'https://vision.replus.co/api' : 'http://localhost:5000/api',
    VISION_ACTIVITY: prod ? 'https://vision.replus.co/activity' : 'ws://localhost:5010',
    VISION_STREAM: prod ? 'https://vision.replus.co/stream' : 'http://localhost:5020',
    PROJECT_ENV: 'replus-162509',
    GOOGLE_MAPS: 'https://maps.googleapis.com/maps/api/geocode/json?key=' + googleMapsApi,
    ERROR_KEY: 'AIzaSyBNs1144i3uKRPvqsXlrrAi4hKrijWrqLE',
};

export const loadEnv = () => {
    window.process.env = env;
};
