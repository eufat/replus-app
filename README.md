# Replus App

A Replus Progressive Web App (PWA) for Replus Remote and Replus Vision.

### Prerequisites

*   Latest Node.js
*   Latest Chrome Browser
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
yarn
```

Start project with

```
yarn run start
```
