import firebase from '@firebase/app';
import '@firebase/auth';

import {firebaseConfig} from './configs.js';

firebase.initializeApp(firebaseConfig);

export {firebase};
