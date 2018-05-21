# Replus App [![CircleCI](https://circleci.com/gh/eufat/replus-app.svg?style=svg&circle-token=b9e8d9011a8a2ef3f465235e9df53eea6507ca42)](https://circleci.com/gh/eufat/replus-app)

A Replus Progressive Web App (PWA) for Replus Remote and Replus Vision.

### Prerequisites

*   Latest Node.js
*   Latest Chrome Browser
*   Google Cloud SDK
*   Polymer CLI
*   Yarn

### Clone and pull all branches

```
git clone https://github.com/eufat/replus-app.git
git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
```

### Install project

Start by installing all dependencies and dev dependencies

```
npm
```

Start project with

```
npm run start
```

### Deploy project

Deployment process include building builds and App Engine deployment

```
yarn run deploy
```
