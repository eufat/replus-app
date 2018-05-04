import {userDataKey, pushLocationTo} from './utils';

const actions = {
    setCurrentUser(user) {
        const currentUser = _.pick(user, userDataKey);
        console.log('dispatching', currentUser);
        return {
            type: 'SET_CURRENT_USER',
            currentUser,
        };
    },
    authenticateUser() {
        if (!(window.location.href.indexOf('dashboard') > -1)) {
            pushLocationTo('/dashboard');
        }

        return {
            type: 'AUTHENTICATE_USER',
        };
    },
    deauthenticateUser() {
        pushLocationTo('/auth');
        firebase.auth().signOut();
        return {
            type: 'DEAUTHENTICATE_USER',
        };
    },
};

export default actions;
