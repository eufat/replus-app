# Replus App [![CircleCI](https://circleci.com/gh/eufat/replus-app.svg?style=svg&circle-token=b9e8d9011a8a2ef3f465235e9df53eea6507ca42)](https://circleci.com/gh/eufat/replus-app) [![Netlify Status](https://api.netlify.com/api/v1/badges/7972ec1e-086f-479c-b635-bc893925a6d1/deploy-status)](https://app.netlify.com/sites/replus/deploys)

A Replus Progressive Web App (PWA) for Replus Devices.

### Prerequisites

-   Latest Node.js
-   Latest Chrome Browser
-   Google Cloud SDK
-   Polymer CLI
-   npm

### Clone

```
git clone https://github.com/eufat/replus-app.git
cd replus-app
```

### Install project

Start by installing all dependencies and dev dependencies

```
rm -rf node_modules && npm install
```

Start project backend on https://github.com/RianWardana/mqtt-remote-api then

```
npm run start
```

### Deploy project

Deployment process automated using Netlify on prod branch
