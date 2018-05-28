export const remoteClient = axios.create({
    baseURL: `http://localhost:7000/api/`,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const visionClient = axios.create({
    baseURL: 'http://localhost:5000/',
    headers: {'Content-Type': 'application/json'},
});
