export const firebaseConfig = {
    apiKey: 'AIzaSyDGCQ24hjwEeQwlus_Knet1_Lnx93Lyy2g',
    authDomain: 'replus-162509.firebaseapp.com',
    databaseURL: 'https://replus-162509.firebaseio.com',
    projectId: 'replus-162509',
    storageBucket: 'replus-162509.appspot.com',
    messagingSenderId: '169133229879',
};

export const env = {
    NODE_ENV: 'development',
    REMOTE_API: 'core.replus.co',
    HOST_ADDRESS: '35.184.71.225',
    PORT_ADDRESS: '5000',
    EVENTS_PORT: '5010',
    STREAM_PORT: '5020',
    PROJECT_ENV: 'replus-162509',
    ERROR_KEY: 'AIzaSyBNs1144i3uKRPvqsXlrrAi4hKrijWrqLE',
};

export const loadEnv = () => {
    window.process.env = env;
};
