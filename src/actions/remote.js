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

export const fetchDevices = () => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');

    remoteClient
        .post('/get-devices', qs({uid}))
        .then((response) => {
            dispatch(setDevices(response.data));
        })
        .catch((error) => console.log(error));
};

export const fetchRooms = () => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');

    remoteClient
        .post('/get-rooms', qs({uid}))
        .then((response) => {
            dispatch(setRooms(response.data.rooms));
        })
        .catch((error) => console.log(error));
};

export const addRoom = (room) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const name = room.name;

    remoteClient
        .post('/room-add', qs({uid, name}))
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const removeRoom = (roomObj) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const room = roomObj.id;

    remoteClient
        .post('/room-delete', qs({uid, room}))
        .then((response) => {
            dispatch(fetchRooms());
        })
        .catch((error) => console.log(error));
};

export const addRemote = (room) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const remoteType = _.get(getState(), 'remote.newRemote.type');
    const remoteBrand = _.get(getState(), 'remote.newRemote.brand');
    const remote = `${remoteType} ${remoteBrand}`;

    remoteClient
        .post('/remote-add', qs({uid, room, remote}))
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const removeRemote = (room, remoteID) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');

    remoteClient
        .post('/remote-delete', qs({uid, room, remoteID}))
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const addDevice = (room) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const deviceID = _.get(getState(), 'remote.newDevice.deviceID');
    const deviceCode = _.get(getState(), 'remote.newDevice.deviceCode');
    const type = 'replus';

    remoteClient
        .post('/device-register', qs({uid, type, deviceID, deviceCode}))
        .then((response) => {
            console.log(response);
            remoteClient
                .post('/device-assign', qs({uid, room, deviceID}))
                .then((response) => console.log(response))
                .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
};

export const removeDevice = (room, deviceID, deviceCode) => (dispatch, getState) => {
    const uid = _.get(getState(), 'app.currentUser.uid');
    const type = 'replus';

    remoteClient
        .post('/device-unassign', qs({uid, room, deviceID}))
        .then((response) => {
            remoteClient
                .post('/device-deregister', {uid, type, deviceID, deviceCode});
        })
        .catch((error) => console.log(error));
};

