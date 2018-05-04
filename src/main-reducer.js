const initialState = {
    currentUser: {},
    isAuthenticated: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'AUTHENTICATE_USER':
            return {
                ...state,
                isAuthenticated: true,
            };
        case 'DEAUTHENTICATE_USER':
            return {
                ...state,
                isAuthenticated: false,
            };
        case 'SET_CURRENT_USER':
            return {
                ...state,
                currentUser: action.currentUser,
            };
        default:
            return state;
    }
};

export default reducer;
