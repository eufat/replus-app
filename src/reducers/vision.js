const initialState = {
    settings: {},
    activeVision: '',
};

const vision = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_VISION_SETTINGS':
            return {
                ...state,
                settings: action.settings,
            };
        case 'SET_ACTIVE_VISION':
            return {
                ...state,
                activeVision: action.activeVision,
            };
        default:
            return state;
    }
};

export default vision;
