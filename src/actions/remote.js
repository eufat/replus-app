import {coreClient, corePost, coreIR, coreSchedule, googleMaps} from '../client';
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

export const setSchedules = (schedules) => (dispatch, getState) => {
    dispatch({
        type: 'SET_SCHEDULES',
        schedules,
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
        const response = await coreClient().get('/get-devices', {params: {uid}});
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
        const response = await coreClient().get('/get-rooms', {params: {uid}});
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

export const editRoom = (room) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const name = room.name;
    const roomID = room.id;
    try {
        await coreClient().put('/room-edit', qs({uid, roomID, name}));
        dispatch(showSnackbar(`Room ${name} saved.`));
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
        await coreClient().delete('/room-delete', {params: {uid, roomID: room.id}});
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

export const removeRemote = (remoteID) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        await coreClient().delete('/remote-delete', {params: {uid, remoteID}});
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

export const removeDevice = (device) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        await coreClient().delete('/device-delete', {params: {uid, device}});
        dispatch(showSnackbar(`Device ${device} deleted.`));
        dispatch(fetchRooms());
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
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

export const createSchedule = (schedules) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const room = get(getState(), 'remote.activeRoom.id');
    const command = schedules.command;
    const scheduleType = schedules.scheduleType;
    const schedule = schedules.schedule;
    const titleRemote = schedules.titleRemote;
    const titleCommand = schedules.titleCommand;
    const titleDay = schedules.titleDay;
    const titleTime = schedules.titleTime;

    try {
        await coreSchedule().post('/create', qs({uid, room, command, scheduleType, schedule, titleRemote, titleCommand, titleDay, titleTime}));
        dispatch(fetchSchedules());
        dispatch(showSnackbar(`Schedule created.`));
    } catch (error) {
        errorHandler.report(error);
    }
    dispatch(closeProgress());
};

export const removeSchedule = (scheduleId) => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        await coreSchedule().post('/delete', qs({uid, scheduleId}));
        dispatch(fetchSchedules());
        dispatch(showSnackbar(`Schedule deleted.`));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const fetchSchedules = () => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');

    try {
        const response = await coreSchedule().get('/fetch', {params: {uid}});
        dispatch(setSchedules(response.data));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const remoteCommand = (command) => (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const activeRemoteRoom = get(getState(), 'remote.activeRemote.room');

    // Iterate over rooms to get devices on desired room
    // the output of devices will be for ex: "ABC123,ABC234".
    const rooms = get(getState(), 'remote.rooms');
    let devices = [];
    for (let room of rooms) {
        if (room.id === activeRemoteRoom) {
            devices = room.devices;
        }
    }
    devices = devices.map((device) => device.name).join(',');

    // Trim whitespaces in any given command.
    const formattedCommand = command.trim();

    try {
        corePost().post('/remote', qs({uid, devices, command: formattedCommand, room: activeRemoteRoom, source: 'app'}));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const addSetting = (command, deviceID) => (dispatch, getState) => {
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        coreClient().post('/device-setup', qs({uid, deviceID}));
    } catch (error) {
        errorHandler.report(error);
    }
};

export const setLocation = (location) => async (dispatch, getState) => {
    dispatch({
        type: 'SET_LOCATION',
        location,
    });
};

export const getLocation = (address) => async (dispatch, getState) => {
    try {
        const response = await googleMaps().get('', {
            params: {
                address: address,
            },
        });
        dispatch(setLocation(response.data));
    } catch (error) {
        errorHandler.report(error);
    }
};

export const setReverseGeocode = (latlng) => async (dispatch, getState) => {
    dispatch({
        type: 'SET_LOCATION',
        location: latlng,
    });
};

export const reverseGeocode = (latlng) => async (dispatch, getState) => {
    try {
        const response = await googleMaps().get('', {
            params: {
                latlng: latlng,
            },
        });
        dispatch(setReverseGeocode(response.data));
    } catch (error) {
        errorHandler.report(error);
    }
};

export const saveLocation = (location) => (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    const roomID = location.roomID;
    const geosenseInRange = location.geosenseInRange;
    const geosenseOutRange = location.geosenseOutRange;
    const lat = location.lat;
    const long = location.long;
    const forecast = '';
    try {
        coreClient().put('/save-location', qs({geosenseInRange, geosenseOutRange, forecast, lat, long}), {params: {uid, roomID}});
        dispatch(fetchLocation());
        dispatch(showSnackbar(`Location saved.`));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};

export const fetchLocation = () => async (dispatch, getState) => {
    dispatch(showProgress());
    const uid = get(getState(), 'app.currentUser.uid');
    try {
        const response = await coreClient().get('/get-rooms', {params: {uid}});
        dispatch(setRooms(response.data));
        dispatch(closeProgress());
    } catch (error) {
        errorHandler.report(error);
        dispatch(closeProgress());
    }
};
