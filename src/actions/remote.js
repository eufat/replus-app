import {coreClient, corePost, coreIR, coreSchedule} from '../client';
import {qs} from '../utils';
import errorHandler from '../error';
import {showSnackbar, showProgress, closeProgress, showBack, closeBack} from './app';
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
export const setActiveRemotes = (activeRemotes) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ACTIVE_REMOTES',
        activeRemotes,
    });
};

export const setActiveDevice = (activeDevice) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ACTIVE_DEVICE',
        activeDevice,
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

export const setSettings = (settings) => (dispatch, getState) => {
    dispatch({
        type: 'SET_REMOTE_SETTINGS',
        settings,
    });
};

export const setManifest = (manifest) => (dispatch, getState) => {
    dispatch({
        type: 'SET_MANIFEST',
        manifest,
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

export const fetchIR = (brand) => async (dispatch, getState) => {
    // dispatch(showProgress());
    try {
        const response = await coreIR().get(`${brand}/manifest.json`);
        dispatch(setManifest(response.data));
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
        dispatch(fetchRooms());
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

export const addCamera = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const deviceID = get(getState(), 'remote.newDevice.deviceID');
    const deviceCode = get(getState(), 'remote.newDevice.deviceCode');
    const type = 'replus-vision';

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

export const setActiveRemote = (activeRemote) => (dispatch, getState) => {
    dispatch(showBack());
    dispatch({
        type: 'SET_ACTIVE_REMOTE',
        activeRemote,
    });
    let brand = get(getState(), 'remote.activeRemote.name');
    brand = brand.substring(3);
    dispatch(fetchIR(brand));
};

export const setActiveRoom = (activeRoom) => (dispatch, getState) => {
    dispatch(showBack());
    dispatch({
        type: 'SET_ACTIVE_ROOM',
        activeRoom,
    });
};

export const setSchedule = (schedule) => (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const room = get(getState(), 'remote.activeRoom.id');

    const newSchedule = {...schedule, uid, room};
    dispatch({
        type: 'SET_SCHEDULE',
        schedule: newSchedule,
    });
    dispatch(closeProgress());
};

export const createSchedule = (schedules) => (dispatch, getState) => {
    dispatch(showProgress());
    dispatch(setSchedule(schedules));
    const uid = get(getState(), 'app.currentUser.uid');
    const room = get(getState(), 'remote.activeRoom.id');
    const command = get(getState(), 'remote.schedule.command');
    const scheduleType = get(getState(), 'remote.schedule.scheduleType');
    const schedule = get(getState(), 'remote.schedule.schedule');
    const titleRemote = get(getState(), 'remote.schedule.titleRemote');
    const titleCommand = get(getState(), 'remote.schedule.titleCommand');
    const titleDay = get(getState(), 'remote.schedule.titleDay');
    const titleTime = get(getState(), 'remote.schedule.titleTime');
    console.log(uid, room, command, scheduleType, schedule, titleRemote, titleCommand, titleDay, titleTime);

    try {
        coreSchedule().post('/schedule-create', qs({uid, room, command, scheduleType, schedule, titleRemote, titleCommand, titleDay, titleTime}));
    } catch (error) {
        errorHandler.report(error);
    }
    dispatch(closeProgress());
};

export const remoteCommand = (command) => (dispatch, getState) => {
    // dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const room = get(getState(), 'remote.activeRemote.room');
    try {
        corePost().post('/remote', qs({uid, room, command}));
        // dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        // dispatch(closeProgress());
    }
};

export const addSetting = (command, deviceID) => (dispatch, getState) => {
    console.log(command, deviceID);
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        coreClient().post('/device-setup', qs({uid, deviceID}));
    } catch (error) {
        errorHandler.report(error);
    }
};
