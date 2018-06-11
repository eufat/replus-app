import {UPDATE_PAGE, UPDATE_OFFLINE, OPEN_SNACKBAR, CLOSE_SNACKBAR, OPEN_PROGRESS, CLOSE_PROGRESS, UPDATE_DRAWER_STATE, AUTHENTICATE_USER, DEAUTHENTICATE_USER, SET_CURRENT_USER} from '../actions/app.js';

const app = (state = {progressOpened: false}, action) => {
    switch (action.type) {
        case UPDATE_PAGE:
            return {
                ...state,
                page: action.page,
            };
        case UPDATE_OFFLINE:
            return {
                ...state,
                offline: action.offline,
            };
        case UPDATE_DRAWER_STATE:
            return {
                ...state,
                drawerOpened: action.opened,
            };
        case OPEN_SNACKBAR:
            return {
                ...state,
                snackbarOpened: true,
                snackbarText: action.text,
            };
        case CLOSE_SNACKBAR:
            return {
                ...state,
                snackbarOpened: false,
                snackbarText: action.text,
            };
        case OPEN_PROGRESS:
            return {
                ...state,
                progressOpened: true,
            };
        case CLOSE_PROGRESS:
            return {
                ...state,
                progressOpened: false,
            };
        case AUTHENTICATE_USER:
            return {
                ...state,
                isAuthenticated: true,
            };
        case DEAUTHENTICATE_USER:
            return {
                ...state,
                isAuthenticated: false,
            };
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.currentUser,
                accessToken: action.accessToken,
            };
        default:
            return state;
    }
};

export default app;
