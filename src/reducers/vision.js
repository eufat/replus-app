const initialState = {
    settings: {},
};

const vision = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SETTINGS':
            return {
                ...state,
                settings: action.settings,
            };
        default:
            return state;
    }
};

export default vision;
