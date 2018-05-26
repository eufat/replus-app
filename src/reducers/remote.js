const initialState = {
    rooms: [],
    newDevice: {},
    newRemote: {}
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
        default:
            return state;
    }
};

export default remote;
