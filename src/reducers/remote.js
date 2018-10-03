import {
    SET_ROOMS,
    NEW_DEVICE,
    NEW_REMOTE,
    SET_ACTIVE_REMOTE,
    SET_ACTIVE_REMOTES,
    SET_ACTIVE_ROOM,
    SET_ACTIVE_DEVICE,
    SET_REMOTE_SETTINGS,
    SET_MANIFEST,
    SET_LOCATION,
    SET_SCHEDULES,
} from '../actions/remote.js';

const initialState = {
    activeDevice: {},
    activeRemote: {},
    activeRemotes: [],
    activeRoom: {},
    rooms: [],
    newDevice: {},
    newRemote: {
        type: 'tv',
        brand: 'changhong',
    },
    settings: {},
    manifest: {},
    location: {},
    schedules: {},
};

const remote = (state = initialState, action) => {
    switch (action.type) {
        case SET_ROOMS:
            return {
                ...state,
                rooms: action.rooms,
            };
        case NEW_DEVICE:
            return {
                ...state,
                newDevice: action.newDevice,
            };
        case NEW_REMOTE:
            return {
                ...state,
                newRemote: action.newRemote,
            };
        case SET_ACTIVE_REMOTE:
            return {
                ...state,
                activeRemote: action.activeRemote,
            };
        case SET_ACTIVE_REMOTES:
            return {
                ...state,
                activeRemotes: action.activeRemotes,
            };
        case SET_ACTIVE_ROOM:
            return {
                ...state,
                activeRoom: action.activeRoom,
            };
        case SET_ACTIVE_DEVICE:
            return {
                ...state,
                activeDevice: action.activeDevice,
            };
        case SET_REMOTE_SETTINGS:
            return {
                ...state,
                settings: action.settings,
            };
        case SET_MANIFEST:
            return {
                ...state,
                manifest: action.manifest,
            };
        case SET_LOCATION:
            return {
                ...state,
                location: action.location,
            };
        case SET_SCHEDULES:
            return {
                ...state,
                schedules: action.schedules,
            };
        default:
            return state;
    }
};

export default remote;
