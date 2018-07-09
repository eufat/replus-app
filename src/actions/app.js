import { pushLocationTo } from '../utils';
import { userDataKey, qs, setCookie, getCookie } from '../utils';
import { createClient, coreClient } from '../client';
import firebase from '../firebase';
import errorHandler from '../error';

const pick = _.pick;

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const OPEN_PROGRESS = 'OPEN_PROGRESS';
export const CLOSE_PROGRESS = 'CLOSE_PROGRESS';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const DEAUTHENTICATE_USER = 'DEAUTHENTICATE_USER';

export const navigate = (path) => (dispatch) => {
    const page = path === '/' ? 'auth' : path.slice(1);

    dispatch(loadPage(page));
};

const loadPage = (page) => async (dispatch) => {
    let paths = page.split('/');
    paths = paths.filter((item) => item !== '');

    const pageList = ['auth', 'dashboard', 'activity', 'rooms', 'settings', 'help', 'account', 'remote-ac', 'remote-tv', 'add-schedule'];

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
                await import('../components/activity-main.js');
                break;
            case 'rooms':
                await import('../components/rooms-main.js');
                break;
            case 'settings':
                await import('../components/settings-main.js');
                break;
            case 'help':
                await import('../components/main-help.js');
                break;
            case 'account':
                await import('../components/main-account.js');
                break;
            case 'remote-ac':
                await import('../components/remote-ac.js');
                break;
            case 'remote-tv':
                await import('../components/remote-tv.js');
                break;
            case 'add-schedule':
                await import('../components/room-add-schedule.js');
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
                headers: {
                    uid: currentUser.uid,
                },
            });
            accessToken = response.data;
            // Save access token to cookie in 30 days
            setCookie('accessToken', accessToken, 7);
        }

        // register with available token
        await coreClient().post(
            '/user-register',
            qs({
                uid: currentUser.uid,
                name: currentUser.displayName,
                email: currentUser.email,
            })
        );

        dispatch({
            type: SET_CURRENT_USER,
            currentUser,
        });
    } catch (error) {
        errorHandler.report(error);
    }
};

export const authenticateUser = () => (dispatch, getState) => {
    if (!(window.location.href.indexOf('dashboard') > -1)) {
        pushLocationTo('/dashboard');
    }

    dispatch({
        type: AUTHENTICATE_USER,
    });
};

export const deauthenticateUser = () => (dispatch, getState) => {
    if (!(window.location.href.indexOf('auth') > -1)) {
        pushLocationTo('/auth');
        firebase.auth().signOut();
    }

    dispatch({
        type: DEAUTHENTICATE_USER,
    });
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
