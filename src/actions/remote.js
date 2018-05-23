import {remoteClient} from '../client';

export const setRooms = (rooms) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ROOMS',
        rooms,
    });
};

export const addRoom = ({uid, name}) => (dispatch, getState) => {
    remoteClient
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
