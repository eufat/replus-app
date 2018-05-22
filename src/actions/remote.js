import {remoteAPI} from '../utils';

export const setRooms = (rooms) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ROOMS',
        rooms,
    });
};

export const addRoom = (uid, name) => (dispatch, getState) => {
    remoteAPI
        .post('/room-add', {
            uid,
            name,
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
};
