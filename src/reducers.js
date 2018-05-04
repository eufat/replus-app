import main from './main-reducer.js';
import vision from './vision-reducer.js';

export default Redux.combineReducers({
    main,
    vision,
});
