import {expandResolution, rotationsList, resolutionsList} from '../utils';
import {visionClient} from '../client';

export const setSettings = (settings) => (dispatch, getState) => {
    dispatch({
        type: 'SET_SETTINGS',
        settings,
    });
};

export const fetchSettings = (uid, dev_name) => (dispatch, getState) => {
    visionClient.get(`/config`, {
        params: {
            user_uid: uid,
            dev_name,
        },
    });
};

export const saveSettings = () => (dispatch, getState) => {
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
        const response = await visionClient.post('/config', payload);
        console.log(response)
    } catch (error) {
        console.log(error)
    }
};
