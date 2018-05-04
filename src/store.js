import rootReducer from './reducers.js';
const initialState = {};

const store = Redux.createStore(rootReducer, initialState);

export default store;
