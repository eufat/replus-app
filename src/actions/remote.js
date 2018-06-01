import {remoteClient} from '../client';
import {qs} from '../utils';

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

export const setDevices = (devices) => (dispatch, getState) => {
    const prevRooms = _.get(getState(), 'remote.rooms');

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
    const uid = _.get(getState(), 'app.currentUser.uid');
    try {
        const response = await remoteClient.post('/get-devices', qs({uid}));
        dispatch(setDevices(response.data));
    } catch (error) {
        console.log(error);
    }
};

export const fetchRooms = () => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    try {
        const response = await remoteClient.post('/get-rooms', qs({uid}));
        dispatch(setRooms(response.data.rooms));
    } catch (error) {
        console.log(error);
    }
};

export const addRoom = (room) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const name = room.name;
    try {
        const response = await remoteClient.post('/room-add', qs({uid, name}));
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

export const removeRoom = (room) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    try {
        const response = remoteClient.post('/room-delete', qs({uid, room: room.id}));
        dispatch(fetchRooms());
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

export const addRemote = (room) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const remoteType = _.get(getState(), 'remote.newRemote.type');
    const remoteBrand = _.get(getState(), 'remote.newRemote.brand');
    const remote = `${remoteType} ${remoteBrand}`;
    try {
        const response = await remoteClient.post('/remote-add', qs({uid, room, remote}));
        dispatch(fetchRooms());
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

export const removeRemote = (room, remoteID) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    try {
        const response = await remoteClient.post('/remote-delete', qs({uid, room, remoteID}));
        dispatch(fetchRooms());
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

export const addDevice = (room) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const deviceID = _.get(getState(), 'remote.newDevice.deviceID');
    const deviceCode = _.get(getState(), 'remote.newDevice.deviceCode');
    const type = 'replus';

    try {
        const response = await remoteClient.post('/device-register', qs({uid, type, room, deviceID, deviceCode}));
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

export const removeDevice = (room, deviceID, deviceCode) => async (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    try {
        const response = remoteClient.post('/device-deregister', qs({uid, deviceID}));
    } catch (error) {
        console.log(error);
    }
};
