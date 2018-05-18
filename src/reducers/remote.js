const initialState = {
    rooms: {},
};

const remote = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ROOMS':
            return {
                ...state,
                rooms: action.rooms,
            };
        default:
            return state;
    }
};

export default remote;
