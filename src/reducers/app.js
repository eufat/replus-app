import {
    UPDATE_PAGE,
    UPDATE_OFFLINE,
    OPEN_SNACKBAR,
    CLOSE_SNACKBAR,
    OPEN_PROGRESS,
    CLOSE_PROGRESS,
    UPDATE_DRAWER_STATE,
    AUTHENTICATE_USER,
    DEAUTHENTICATE_USER,
    SET_CURRENT_USER,
    OPEN_BACK,
    CLOSE_BACK,
    SET_NOTIFICATION,
    SET_GEOLOCATION_STATE,
    SET_GEOLOCATION_LATLONG,
    SET_GEOLOCATION_ID,
} from '../actions/app.js';

const initialState = {
    progressOpened: false,
    backable: false,
    notification: false,
};

const app = (state = initialState, action) => {
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
        case OPEN_BACK:
            return {
                ...state,
                backable: true,
            };
        case CLOSE_BACK:
            return {
                ...state,
                backable: false,
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
        case SET_NOTIFICATION:
            return {
                ...state,
                notification: action.notification,
            };
        case SET_GEOLOCATION_STATE:
            return {
                ...state,
                geolocation: {
                    ...state.geolocation,
                    state: action.state,
                },
            };
        case SET_GEOLOCATION_ID:
            return {
                ...state,
                geolocation: {
                    ...state.geolocation,
                    id: action.id,
                },
            };
        case SET_GEOLOCATION_LATLONG:
            return {
                ...state,
                geolocation: {
                    ...state.geolocation,
                    latitude: action.latitude,
                    longitude: action.longitude,
                },
            };
        default:
            return state;
    }
};

export default app;
