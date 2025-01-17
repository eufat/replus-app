import pick from 'lodash/pick';
import get from 'lodash/get';
import { pushLocationTo } from '../utils';
import { userDataKey, qs, setCookie, getCookie } from '../utils';
import { createClient, coreClient } from '../client';
import { firebase } from '../firebase.js';
import errorHandler from '../error';
import { fetchRooms, fetchSchedules } from './remote';
import { fetchActivities } from './activity';

// Define app action types
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
                await import('../components/remote-tv-2.js');
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

        dispatch(fetchRooms());
        dispatch(fetchActivities('owner', currentUser.uid));
        dispatch(fetchSchedules());
        dispatch(fetchUser());
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

export const setNotification = (notification) => (dispatch, getState) => {
    dispatch({
        type: SET_NOTIFICATION,
        notification,
    });
};

export const notification = (state) => (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const name = get(getState(), 'app.currentUser.displayName');
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
            dispatch(showSnackbar('Notification on'));
        } else {
            dispatch(showSnackbar('Notification off'));
        }
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
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

            // dispatch(showSnackbar('Geolocation off'));
        }

        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
