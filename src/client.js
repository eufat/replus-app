export const remoteClient = axios.create({
    baseURL: `http://core.replus.co/api/`,
    headers: {'Content-Type': 'text/plain'},
});

export const visionClient = axios.create({
    baseURL: 'http://35.184.71.225:5000/',
    headers: {'Content-Type': 'application/json'},
});
