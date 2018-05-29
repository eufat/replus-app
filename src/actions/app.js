import { pushLocationTo } from '../utils';
import { userDataKey, qs } from '../utils';
import { visionClient, remoteClient } from '../client';

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

const loadPage = (page) => (dispatch) => {
    const pageList = ['auth', 'dashboard', 'dashboard/activity', 'dashboard/rooms', 'dashboard/settings', 'dashboard/help', 'dashboard/account'];

    if (pageList.indexOf(page) === -1) {
        page = '404';
    }

    dispatch(updatePage(page));

    const paths = page.split('/');

    paths.forEach(async (path, index) => {
        console.log(`loaded path ${index}:`, path);
        switch (page) {
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
            default:
                page = '404';
                await import('../components/not-found.js');
        }
    });
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

export const setCurrentUser = (user) => (dispatch, getState) => {
    const currentUser = _.pick(user, userDataKey);
    const payload = {
        uid: currentUser.uid,
        display_name: currentUser.displayName,
        email: currentUser.email,
        device_list: {},
    };

    visionClient
        .post('/profile', payload)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });

    remoteClient
        .post(
            '/user-register',
            qs({
                uid: currentUser.uid,
                name: currentUser.displayName,
                email: currentUser.email,
            })
        )
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });

    dispatch({
        type: SET_CURRENT_USER,
        currentUser,
    });
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
    pushLocationTo('/auth');
    firebase.auth().signOut();

    dispatch({
        type: DEAUTHENTICATE_USER,
    });
};
