const initialState = {
    settings: {},
};

const reducer = (state = initialState, action) => {
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

export default reducer;
