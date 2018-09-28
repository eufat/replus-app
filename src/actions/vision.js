/* eslint-disable camelcase */
import {expandResolution, rotationsList, resolutionsList} from '../utils.js';
import {visionClient} from '../client.js';
import errorHandler from '../error.js';

// Define vision action types
export const SET_VISION_SETTINGS = 'SET_VISION_SETTINGS';
export const SET_ACTIVE_VISION = 'SET_ACTIVE_VISION';

export const setSettings = (settings) => (dispatch, getState) => {
    dispatch({
        type: SET_VISION_SETTINGS,
        settings,
    });
};

export const fetchSettings = (uid, dev_name) => (dispatch, getState) => {
    visionClient().get(`/config`, {
        params: {
            user_uid: uid,
            dev_name,
        },
    });
};

export const setActiveVision = (name) => (dispatch, getState) => {
    dispatch({
        type: SET_ACTIVE_VISION,
        activeVision: name,
    });
};

export const saveSettings = () => async (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;
    const settings = getState().vision.settings;

    const resolution = expandResolution(resolutionsList[settings.resolution]);
    const rotation = parseInt(rotationsList[settings.rotation].split('°')[0]);

    const payload = {
        user_uid: uid,
        dev_name: settings.deviceName,
        config: {
            mode: {
                stream: 'n',
                extLogging: 'n',
            },
            IO: {
                shutdown: 'n',
                restart: 'n',
                start: 'y',
                lamp: settings.lamp,
            },
            img_config: {
                img_res: {
                    width: resolution.width,
                    height: resolution.height,
                },
                img_rot: rotation,
            },
        },
    };

    try {
        await visionClient().post('/config', payload);
    } catch (error) {
        errorHandler.report(error);
    }
};
