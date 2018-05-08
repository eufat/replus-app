export const firebaseConfig = {
    apiKey: "AIzaSyDGCQ24hjwEeQwlus_Knet1_Lnx93Lyy2g",
    authDomain: "replus-162509.firebaseapp.com",
    databaseURL: "https://replus-162509.firebaseio.com",
    projectId: "replus-162509",
    storageBucket: "replus-162509.appspot.com",
    messagingSenderId: "169133229879"
};

export const env = {
    HOST_ADDRESS: "127.0.0.1",
    PORT_ADDRESS: "5000",
    EVENTS_PORT: "5010",
    STREAM_PORT: "5020",
    GCP_PROJECT: "replus-162509"
};

export const loadEnv = () => {
    windows.process.env = env;
};
