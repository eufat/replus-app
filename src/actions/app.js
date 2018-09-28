import pick from 'lodash/pick';
import get from 'lodash/get';
import { pushLocationTo, log } from '../utils';
import { userDataKey, qs, setCookie, getCookie, urlB64ToUint8Array } from '../utils';
import { createClient, coreClient } from '../client';
import firebase from '../firebase';
import errorHandler from '../error';
import { fetchRooms, fetchSchedules } from './remote';
import { fetchActivities } from './activity';
import { env } from '../configs';

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const OPEN_PROGRESS = 'OPEN_PROGRESS';
export const CLOSE_PROGRESS = 'CLOSE_PROGRESS';
export const OPEN_BACK = 'OPEN_BACK';
export const CLOSE_BACK = 'CLOSE_BACK';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const DEAUTHENTICATE_USER = 'DEAUTHENTICATE_USER';
export const SET_NOTIFICATION = 'SET_NOTIFICATION';
export const SET_GEOLOCATION_STATE = 'SET_GEOLOCATION_STATE';
export const SET_GEOLOCATION_LATLONG = 'SET_GEOLOCATION_LATLONG';
export const SET_GEOLOCATION_ID = 'SET_GEOLOCATION_ID';
export const SET_SERVICE_WORKERS = 'SET_SERVICE_WORKERS';

export const navigate = (path) => (dispatch) => {
    const page = path === '/' ? 'auth' : path.slice(1);

    dispatch(loadPage(page));
};

const loadPage = (page) => async (dispatch) => {
    let paths = page.split('/');
    paths = paths.filter((item) => item !== '');

    const pageList = ['auth', 'dashboard', 'rooms', 'activity', 'metrics', 'settings', 'setting-vision', 'setting-remote', 'help', 'remote-ac', 'remote-tv', 'room-schedule', 'room-location'];

    for (const path of paths) {
        if (!(pageList.indexOf(path) > -1)) {
            page = '404';
        }

        switch (path) {
            case 'auth':
                await import('../components/main-auth.js');
                break;
            case 'dashboard':
                await import('../components/main-dashboard.js');
                break;
            case 'activity':
                await import('../components/main-activity.js');
                break;
            case 'metrics':
                await import('../components/main-metrics.js');
                break;
            case 'rooms':
                await import('../components/main-rooms.js');
                break;
            case 'settings':
                await import('../components/main-settings.js');
                break;
            case 'help':
                await import('../components/main-help.js');
                break;
            case 'setting-vision':
                await import('../components/settings-vision.js');
                break;
            case 'setting-remote':
                await import('../components/settings-remote.js');
                break;
            case 'remote-ac':
                await import('../components/remote-ac.js');
                break;
            case 'remote-tv':
                await import('../components/remote-tv.js');
                break;
            case 'room-schedule':
                await import('../components/room-schedule.js');
                break;
            case 'room-location':
                await import('../components/room-location.js');
                break;
            default:
                page = '404';
                await import('../components/not-found.js');
        }
    }

    dispatch(updatePage(page));
};

const updatePage = (page) => {
    return {
        type: UPDATE_PAGE,
        page,
    };
};

let snackbarTimer;

export const showSnackbar = (text) => (dispatch) => {
    dispatch({
        type: OPEN_SNACKBAR,
        text,
    });
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => dispatch({ type: CLOSE_SNACKBAR, text: '' }), 3000);
};

export const showProgress = () => (dispatch) => {
    dispatch({
        type: OPEN_PROGRESS,
    });
};

export const closeProgress = () => (dispatch) => {
    dispatch({
        type: CLOSE_PROGRESS,
    });
};

export const showBack = () => (dispatch) => {
    dispatch({
        type: OPEN_BACK,
    });
};

export const closeBack = () => (dispatch) => {
    dispatch({
        type: CLOSE_BACK,
    });
};

export const updateOffline = (offline) => (dispatch, getState) => {
    // Show the snackbar, unless this is the first load of the page.
    if (getState().app.offline !== undefined) {
        dispatch(showSnackbar(`You are now ${offline ? 'offline' : 'online'}.`));
    }
    dispatch({
        type: UPDATE_OFFLINE,
        offline,
    });
};

export const updateLayout = (wide) => (dispatch, getState) => {
    if (getState().app.drawerOpened) {
        dispatch(updateDrawerState(false));
    }
};

export const updateDrawerState = (opened) => (dispatch, getState) => {
    if (getState().app.drawerOpened !== opened) {
        dispatch({
            type: UPDATE_DRAWER_STATE,
            opened,
        });
    }
};

export const setCurrentUser = (user) => async (dispatch, getState) => {
    const currentUser = pick(user, userDataKey);

    try {
        let accessToken = getCookie('accessToken');
        if (!accessToken) {
            // If no token in cookie as api to build token with designated uid
            const coreClient = createClient('core');
            const response = await coreClient.get('/get-token', {
                params: {
                    uid: currentUser.uid,
                },
            });

            accessToken = response.data;
            // Save access token to cookie in 30 days
            setCookie('accessToken', accessToken, 7);
        }

        dispatch({
            type: SET_CURRENT_USER,
            currentUser,
        });

        dispatch(initServiceWorkers());
        dispatch(fetchUser());
        dispatch(fetchRooms());
        dispatch(fetchSchedules());
        dispatch(fetchActivities('owner', currentUser.uid));
    } catch (error) {
        errorHandler.report(error);
    }
};

export const fetchUser = () => async (dispatch, getState) => {
    const uid = get(getState(), 'app.currentUser.uid');
    const name = get(getState(), 'app.currentUser.displayName');
    const email = get(getState(), 'app.currentUser.email');
    try {
        const response = await coreClient().post('/user-register', qs({ uid, name, email }));
        dispatch(setNotification(response.data.notification === 'true'));
        dispatch(setGeolocation(response.data.geolocation === 'true'));
    } catch (error) {
        errorHandler.report(error);
    }
};

export const authenticateUser = (callback) => (dispatch, getState) => {
    if (!(window.location.href.indexOf('dashboard') > -1)) {
        pushLocationTo('/dashboard');
    }

    dispatch({
        type: AUTHENTICATE_USER,
    });

    if (callback) callback();
};

export const deauthenticateUser = (callback) => (dispatch, getState) => {
    if (!(window.location.href.indexOf('auth') > -1)) {
        pushLocationTo('/auth');
        firebase.auth().signOut();
    }

    dispatch({
        type: DEAUTHENTICATE_USER,
    });

    if (callback) callback();
};

export const linkWithProvider = (providerType) => async (dispatch, getState) => {
    let provider;

    switch (providerType) {
        case 'google':
            provider = new firebase.auth.GoogleAuthProvider();
            break;
        case 'facebook':
            provider = new firebase.auth.FacebookAuthProvider();
            break;
    }

    const auth = firebase.auth();

    try {
        auth.currentUser.linkWithRedirect(provider);
        const result = await firebase.auth().getRedirectResult();

        if (result.credential) {
            let credential = result.credential;
            let resultUser = result.user;
            const user = await auth.signInWithCredential(credential);
            await user.delete();
            await resultUser.linkWithCredential(credential);
            const finalUser = await auth.signInWithCredential(credential);
            dispatch(setCurrentUser(finalUser));
        }
    } catch (error) {
        errorHandler.report(error);
    }
};

export const setServiceWorkers = (serviceWorkers) => (dispatch, getState) => {
    dispatch({
        type: SET_SERVICE_WORKERS,
        serviceWorkers,
    });
};

export const initServiceWorkers = () => async (dispatch, getState) => {
    /* Load and register pre-caching Service Worker */
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        log('Service Worker and Push is supported');

        try {
            const swRegistration = await navigator.serviceWorker.register('/service-worker.js');
            log('Service Worker is registered', swRegistration);

            swRegistration.pushManager.getSubscription().then(function(subscription) {
                const isSubscribed = !(subscription === null);

                if (isSubscribed) {
                    log('User IS subscribed.');
                } else {
                    log('User is NOT subscribed.');
                }

                setServiceWorkers({
                    isSubscribed,
                    swRegistration,
                });
            });
        } catch (err) {
            errorHandler.report('Service Worker Error', error);
        }
    } else {
        log('Push messaging is not supported');
    }
};

export const setNotification = (notification) => (dispatch, getState) => {
    dispatch({
        type: SET_NOTIFICATION,
        notification,
    });
};

export const notification = (state) => (dispatch, getState) => {
    dispatch(showProgress());
    const applicationServerPublicKey = env.SERVER_KEY;
    const uid = get(getState(), 'app.currentUser.uid');
    const name = get(getState(), 'app.currentUser.displayName');
    let swRegistration = get(getState(), 'app.serviceWorkers.swRegistration');

    async function subscribeUser() {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        try {
            await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey,
            });

            setServiceWorkers({
                isSubscribed: true,
                swRegistration,
            });

            log('User is subscribed.');
        } catch (err) {
            log('Failed to subscribe the user: ', err);
        }
    }

    async function unsubscribeUser() {
        try {
            const subscription = await swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                setServiceWorkers({
                    isSubscribed: false,
                    swRegistration,
                });

                log('User is unsubscribed.');
            }
        } catch (err) {
            log('Error unsubscribing', error);
        }
    }

    try {
        coreClient().put('/user-edit', qs({ name, notification: state }), { params: { uid } });
        dispatch(setNotification(state));
        if (state) {
            Notification.requestPermission((status) => {
                log(`Notification permission status: ${status}`);
            });

            if (Notification.permission !== 'granted') {
                Notification.requestPermission((permission) => {
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                });
            }

            subscribeUser();
            dispatch(showSnackbar('Notification on'));
        } else {
            unsubscribeUser();
            dispatch(showSnackbar('Notification off'));
        }
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const displayNotification = (message) => {
    const options = {
        body: message,
    };

    if (Notification.permission == 'granted') {
        if (this.notification == 'true') {
            navigator.serviceWorker.getRegistration().then((reg) => {
                reg.showNotification('Replus App', options);
            });
        }
    }
};

export const setGeolocation = (state) => (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const name = get(getState(), 'app.currentUser.displayName');

    try {
        coreClient().put('/user-edit', qs({ name, geolocation: state }), { params: { uid } });
        dispatch({
            type: SET_GEOLOCATION_STATE,
            state,
        });

        if (state) {
            if ('geolocation' in navigator) {
                const watchID = navigator.geolocation.watchPosition((position) => {
                    dispatch({
                        type: SET_GEOLOCATION_LATLONG,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                });

                dispatch({
                    type: SET_GEOLOCATION_ID,
                    id: watchID,
                });

                dispatch(showSnackbar('Geolocation started'));
            } else {
                dispatch(showSnackbar('Geolocation not available'));
            }
        } else {
            const watchID = get(getState(), 'app.geolocation.id');
            navigator.geolocation.clearWatch(watchID);

            dispatch({
                type: SET_GEOLOCATION_LATLONG,
                latitude: '',
                longitude: '',
            });

            dispatch({
                type: SET_GEOLOCATION_ID,
                id: '',
            });

            dispatch(showSnackbar('Geolocation off'));
        }

        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
