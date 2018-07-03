const initialState = {
    activeRemote: {},
    rooms: [],
    newDevice: {},
    newRemote: {
        type: 'tv',
        brand: 'samsung',
    },
    settings: {},
};

const remote = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ROOMS':
            return {
                ...state,
                rooms: action.rooms,
            };
        case 'NEW_DEVICE':
            return {
                ...state,
                newDevice: action.newDevice,
            };
        case 'NEW_REMOTE':
            return {
                ...state,
                newRemote: action.newRemote,
            };
        case 'SET_ACTIVE_REMOTE':
            return {
                ...state,
                activeRemote: action.activeRemote,
            };
        case 'SET_SETTINGS':
            return {
                ...state,
                settings: action.settings,
            };
        default:
            return state;
    }
};

export default remote;
