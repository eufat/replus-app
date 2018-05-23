import { pushLocationTo } from '../utils';
import { userDataKey } from '../utils';
import { visionClient } from '../client';

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const DEAUTHENTICATE_USER = 'DEAUTHENTICATE_USER';

export const navigate = (path) => (dispatch) => {
    // Extract the page name from path.
    const page = path === '/' ? 'auth' : path.slice(1);

    dispatch(loadPage(page));

    // Close the drawer - in case the *path* change came from a link in the drawer.
    dispatch(updateDrawerState(false));
};

const loadPage = (page) => async (dispatch) => {
    switch (page) {
        case 'auth':
            await import('../components/main-auth.js');
            break;
        default:
            page = '404';
            await import('../components/main-not-found.js');
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

export const showSnackbar = () => (dispatch) => {
    dispatch({
        type: OPEN_SNACKBAR,
    });
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => dispatch({ type: CLOSE_SNACKBAR }), 3000);
};

export const updateOffline = (offline) => (dispatch, getState) => {
    // Show the snackbar, unless this is the first load of the page.
    if (getState().app.offline !== undefined) {
        dispatch(showSnackbar());
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

    console.log(payload);

    visionClient
        .post('/profile', payload)
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
