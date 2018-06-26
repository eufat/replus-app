import {coreClient} from '../client';
import {qs} from '../utils';
import errorHandler from '../error';
import {showSnackbar, showProgress, closeProgress} from '../actions/app';
import {toTitleCase} from '../utils';
const get = _.get; // import from lodash

export const setRooms = (rooms) => (dispatch, getState) => {
    if (rooms) {
        dispatch({
            type: 'SET_ROOMS',
            rooms,
        });
    }
};

export const setNewDevice = (newDevice) => (dispatch, getState) => {
    dispatch({
        type: 'NEW_DEVICE',
        newDevice,
    });
};

export const setNewRemote = (newRemote) => (dispatch, getState) => {
    dispatch({
        type: 'NEW_REMOTE',
        newRemote,
    });
};

export const setActiveRemote = (activeRemote) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ACTIVE_REMOTE',
        activeRemote,
    });
};

export const setDevices = (devices) => (dispatch, getState) => {
    const prevRooms = get(getState(), 'remote.rooms');

    const newRooms = prevRooms.map((room) => {
        const roomDevices = devices.filter((device) => {
            return device.room === room.id;
        });

        const newRoom = {...room, devices: roomDevices};
        return newRoom;
    });

    dispatch({
        type: 'SET_ROOMS',
        rooms: newRooms,
    });
};

export const fetchDevices = () => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        const response = await coreClient().post('/get-devices', qs({uid}));
        dispatch(setDevices(response.data));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const fetchRooms = () => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        const response = await coreClient().post('/get-rooms', qs({uid}));
        dispatch(setRooms(response.data));
        dispatch(fetchDevices());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const addRoom = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const name = room.name;
    try {
        await coreClient().post('/room-add', qs({uid, name}));
        dispatch(showSnackbar(`Room ${name} added.`));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const removeRoom = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const name = room.name;
    try {
        await coreClient().post('/room-delete', qs({uid, room: room.id}));
        dispatch(showSnackbar(`Room ${name} deleted.`));
        dispatch(fetchRooms());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const addRemote = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const remoteType = get(getState(), 'remote.newRemote.type');
    const remoteBrand = get(getState(), 'remote.newRemote.brand');
    const remote = `${remoteType} ${remoteBrand}`;
    try {
        await coreClient().post('/remote-add', qs({uid, room, remote}));
        dispatch(showSnackbar(`Remote ${toTitleCase(remote)} added.`));
        dispatch(fetchRooms());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const removeRemote = (room, remoteID) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        await coreClient().post('/remote-delete', qs({uid, room, remoteID}));
        dispatch(showSnackbar(`Remote deleted.`));
        dispatch(fetchRooms());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const addDevice = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const deviceID = get(getState(), 'remote.newDevice.deviceID');
    const deviceCode = get(getState(), 'remote.newDevice.deviceCode');
    const type = 'replus-remote';

    try {
        await coreClient().post('/device-register', qs({uid, type, room: room.id, deviceID, deviceCode}));
        dispatch(showSnackbar(`Device ${deviceID} registered.`));
        dispatch(fetchDevices());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(showSnackbar(`Failed to register ${deviceID}.`));
        dispatch(closeProgress());
    }
};

export const removeDevice = (room, deviceID, deviceCode) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        coreClient().post('/device-deregister', qs({uid, deviceID}));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
