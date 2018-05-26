import {remoteClient} from '../client';

export const setRooms = (rooms) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ROOMS',
        rooms,
    });
};


export const fetchDevices = () => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;

    remoteClient
        .post('/get-devices', {uid})
        .then((response) => {});
};

export const fetchRooms = () => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;

    remoteClient
        .post('/get-rooms', {uid})
        .then((response) => {
            setRooms(response);
        })
        .catch((error) => console.log(error));
};

export const addRoom = (room) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;
    const name = room;

    remoteClient
        .post('/room-add', {uid, name})
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const removeRoom = (room) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;
    const name = room;

    remoteClient
        .post('/room-delete', {uid, name})
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const addRemote = (room, remote) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;

    remoteClient
        .post('/remote-add', {uid, room, remote})
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const removeRemote = (room, remoteID) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;

    remoteClient
        .post('/remote-delete', {uid, room, remoteID})
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
};

export const addDevice = (room, deviceID, deviceCode) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;
    const type = 'replus';

    remoteClient
        .post('/device-register', {uid, type, deviceID, deviceCode})
        .then((response) => {
            remoteClient
                .post('/device-assign', {uid, room, deviceID});
        })
        .catch((error) => console.log(error));
};

export const removeDevice = (room, deviceID, deviceCode) => (dispatch, getState) => {
    const uid = getState().app.currentUser.uid;
    const type = 'replus';

    remoteClient
        .post('/device-unassign', {uid, room, deviceID})
        .then((response) => {
            remoteClient
                .post('/device-deregister', {uid, type, deviceID, deviceCode});
        })
        .catch((error) => console.log(error));
};

