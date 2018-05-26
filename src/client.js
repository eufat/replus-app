export const remoteClient = axios.create({
    baseURL: `https://core.replus.co/api/`,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const visionClient = axios.create({
    baseURL: 'http://35.184.71.225:5000/',
    headers: {'Content-Type': 'application/json'},
});
