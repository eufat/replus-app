import {
    PolymerElement,
    html,
} from '/node_modules/@polymer/polymer/polymer-element.js';
import PolymerRedux from '/node_modules/polymer-redux/polymer-redux.js';

import '/node_modules/@polymer/iron-ajax/iron-ajax.js';
import '/node_modules/@polymer/paper-material/paper-material.js';
import '/node_modules/@polymer/paper-spinner/paper-spinner.js';
import '/node_modules/@polymer/paper-button/paper-button.js';

import {firebaseConfig} from './configs.js';
import {userDataKey} from './utils.js';
import store from './store.js';
import actions from './main-actions.js';
const ReduxMixin = PolymerRedux(store);

class MainAuth extends ReduxMixin(PolymerElement) {
    static get actions() {
        return actions;
    }

    ready() {
        super.ready();

        const thisMainAuth = this;
        firebase.initializeApp(firebaseConfig);

        thisMainAuth.setupPosition();

        this.$.firebaseuicontainer.style.display = 'none.js';

        window.addEventListener('resize', () => {
            this.setupPosition();
        });

        this.loadFirebaseUI();
    }

    setupPosition() {
        const thisMainAuth = this;
        thisMainAuth.$.container.style.marginTop =
            (window.innerHeight - 294) / 2 - 100 + 'px.js';
        thisMainAuth.$.container.style.marginLeft =
            (window.innerWidth - 300) / 2 + 'px.js';

        if (window.innerWidth < 640) {
            thisMainAuth.$.container.style.marginTop =
                (window.innerHeight - 294) / 2 + 'px.js';
        }
    }

    loadFirebaseUI() {
        const thisMainAuth = this;
        const uiConfig = {
            signInSuccessUrl: '/dashboard',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                {
                    provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    scopes: ['public_profile', 'email'],
                },
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    const currentUser = _.pick(authResult.user, userDataKey);
                    thisMainAuth.dispatch('setCurrentUser', currentUser);
                    thisMainAuth.dispatch('authenticateUser');
                    return true;
                },
                uiShown: () => {
                    thisMainAuth.$.firebaseuicontainer.style.display =
                        'block.js';
                    thisMainAuth.$.spinner.style.display = 'none.js';
                },
            },
        };

        this.ui = new firebaseui.auth.AuthUI(firebase.auth());

        this.ui.start(thisMainAuth.$.firebaseuicontainer, uiConfig);
    }

    static get template() {
        return html`
            <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/2.7.0/firebaseui.css" />
            <style>
                :host {
                    display: block;
                }

                div#spinner {
                    padding: 20px;
                }

                p {
                    margin: 0 24px 0 30px;
                    color: #252525;
                }

                p#header {
                    margin-top: 20px;
                    font-size: 32px;
                }

                p#subheader {
                    font-size: 16px;
                    margin-bottom: 10px;
                }

                p#subheader span {
                    color: #2B5788;
                }

                paper-material {
                    display: block;
                    width: 300px;
                    padding: 16px;
                    padding-bottom: 25px;
                    background: #fbfbfb;
                    background: -webkit-linear-gradient(#fbfbfb, #f8f8f8);
                    background: -o-linear-gradient(#fbfbfb, #f8f8f8);
                    background: -moz-linear-gradient(#fbfbfb, #f8f8f8);
                    background: linear-gradient(#fbfbfb, #f8f8f8);
                }

                paper-spinner {
                    --paper-spinner-layer-1-color: var(--app-primary-color);
                    --paper-spinner-layer-3-color: var(--app-primary-color);
                    --paper-spinner-layer-2-color: #3498db;
                    --paper-spinner-layer-4-color: #3498db;
                }

                #container {
                    width: 300px;
                }
            </style>
            <div id="container" class="vertical layout">
                <paper-material>
                    <p id="header">Sign in</p>
                    <p id="subheader">to continue using Replus App</p>
                    <div id="spinner" class="horizontal layout center-justified">
                        <paper-spinner active></paper-spinner>
                    </div>
                    <div id="firebaseuicontainer"></div>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-auth', MainAuth);
