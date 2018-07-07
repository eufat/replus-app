const initialState = {
    activeRemote: {},
    activeRemotes: [],
    schedule: {},
    rooms: [],
    newDevice: {},
    newRemote: {
        type: 'tv',
        brand: 'samsung',
    },
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
        case 'SET_SCHEDULE':
            return {
                ...state,
                schedule: action.schedule,
            };
        case 'SET_ACTIVE_REMOTE':
            return {
                ...state,
                activeRemote: action.activeRemote,
            };
        case 'SET_ACTIVE_REMOTES':
            return {
                ...state,
                activeRemotes: action.activeRemotes,
            };
        default:
            return state;
    }
};

export default remote;
