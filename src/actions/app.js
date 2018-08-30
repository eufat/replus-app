import { pushLocationTo } from '../utils';
import { userDataKey, qs, setCookie, getCookie } from '../utils';
import { createClient, coreClient, coreActivity } from '../client';
import firebase from '../firebase';
import errorHandler from '../error';
import { fetchRooms, fetchSchedules } from './remote';
import { fetchActivities } from './activity';

const pick = _.pick;

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

const pageList = [
    {
        path: 'auth',
        component: '../components/main-auth.js',
    },
    {
        path: 'dashboard',
        component: '../components/main-dashboard.js',
    },
    {
        path: 'activity',
        component: '../components/main-activity.js',
    },
    {
        path: 'metrics',
        component: '../components/main-metrics.js',
    },
    {
        path: 'rooms',
        component: '../components/main-rooms.js',
    },
    {
        path: 'help',
        component: '../components/main-help.js',
    },
    {
        path: 'account',
        component: '../components/main-account.js',
    },
    {
        path: 'settings',
        component: '../components/main-settings.js',
    },
    {
        path: 'setting-vision',
        component: '../components/setting-vision.js',
    },
    {
        path: 'setting-remote',
        component: '../components/setting-remote.js',
    },
    {
        path: 'remote-ac',
        component: '../components/remote-ac.js',
    },
    {
        path: 'remote-tv',
        component: '../components/remote-tv.js',
    },
    {
        path: 'add-schedule',
        component: '../components/room-add-schedule.js',
    },
    {
        path: 'add-location',
        component: '../components/room-add-location.js',
    },
    {
        path: '404',
        component: '../components/not-found.js',
    },
];

export const navigate = (path) => (dispatch) => {
    const page = path === '/' ? 'auth' : path.slice(1);

    dispatch(loadPage(page));
};

const loadPage = (page) => async (dispatch) => {
    // Parse path to array. For example: 'dashboard/rooms' to ['dashboard', 'rooms']
    const paths = page.split('/').filter((item) => item !== '');

    const pageListPaths = pageList.map((page) => page.path);

    for (const path of paths) {
        // If not listed, use 404 as not found page
        if (!(pageListPaths.indexOf(path) > -1)) {
            page = '404';
        }

        // Import respective component for page's path
        for (let item of pageList) {
            if (path === item.path) {
                await import(item.component);
            } else {
                await import('../components/not-found');
            }
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
        dispatch(fetchActivities());
        dispatch(fetchSchedules());

        // register with available token
        await coreClient().post(
            '/user-register',
            qs({
                uid: currentUser.uid,
                name: currentUser.displayName,
                email: currentUser.email,
            })
        );
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
