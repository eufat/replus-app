export const setRooms = (rooms) => (dispatch, getState) => {
    dispatch({
        type: 'SET_ROOMS',
        rooms,
    });
};
