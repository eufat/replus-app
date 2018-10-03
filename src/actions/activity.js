import {showProgress, closeProgress} from './app';
import {coreActivity} from '../client';
import errorHandler from '../error';
import get from 'lodash/get';

// Define activity action types
export const SET_ACTIVITIES = 'SET_ACTIVITIES';

export const setActivities = (activities) => (dispatch, getState) => {
    if (activities) {
        dispatch({
            type: SET_ACTIVITIES,
            activities,
        });
    }
};

export const fetchActivities = (by, id) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');

    try {
        let response;
        if (by == 'date') {
            const before = parseInt(id.endDate);
            const after = parseInt(id.startDate);
            response = await coreActivity().get('/activity/fetch', {params: {uid, by, before, after}});
        } else {
            response = await coreActivity().get('/activity/fetch', {params: {uid, id, by}});
        }
        dispatch(setActivities(response.data));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
