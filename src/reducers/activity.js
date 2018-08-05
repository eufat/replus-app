import {SET_ACTIVITIES} from '../actions/activity.js';

const initialState = {
    activities: {},
};

const activity = (state = initialState, action) => {
    switch (action.type) {
        case SET_ACTIVITIES:
            return {
                ...state,
                activities: action.activities,
            };
        default:
            return state;
    }
};

export default activity;
