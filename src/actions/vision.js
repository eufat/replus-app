export const setSettings = (settings) => (dispatch, getState) => {
    dispatch({
        type: 'SET_SETTINGS',
        settings,
    });
};

export const saveSettings = (settings) => {
    console.log(settings);
};
