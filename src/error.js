import {env} from './configs.js';
let errorHandler;

if (env.NODE_ENV === 'production') {
    errorHandler = new StackdriverErrorReporter();
    errorHandler.start({
        key: env.ERROR_KEY,
        projectId: env.PROJECT_ENV,
    });
} else {
    errorHandler = {report: console.error};
}

export default errorHandler;
