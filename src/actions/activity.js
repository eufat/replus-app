import {showSnackbar, showProgress, closeProgress, showBack, closeBack} from './app';
import {coreActivity} from '../client';
import errorHandler from '../error';
import {env} from '../configs';

const get = _.get;

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
        const response = await coreActivity().get('/activity/fetch', {params: {uid, id, by}});
        dispatch(setActivities(response.data));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
