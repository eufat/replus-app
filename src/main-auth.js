import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import PolymerRedux from 'polymer-redux/polymer-redux';

import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-spinner/paper-spinner';
import '@polymer/paper-button/paper-button';
import {firebaseConfig} from './configs';

import store from './main-store';
const ReduxMixin = PolymerRedux(store);

const userDataKey = ['uid', 'email', 'displayName', 'photoURL'];

class MainAuth extends ReduxMixin(PolymerElement) {
    static get actions() {
        return {
            setCurrentUser(user) {
                const currentUser = _.pick(user, userDataKey);
                return {
                    type: 'SET_CURRENT_USER',
                    currentUser,
                };
            },
            authenticateUser() {
                if (!(window.location.href.indexOf('dashboard') > -1)) {
                    window.location = '/dashboard';
                }

                return {
                    type: 'AUTHENTICATE_USER',
                };
            },
            deauthenticateUser() {
                firebase.auth().signOut();
                return {
                    type: 'DEAUTHENTICATE_USER',
                };
            },
        };
    }

    ready() {
        super.ready();
        const thisMainAuth = this;
        firebase.initializeApp(firebaseConfig);
        thisMainAuth.setupPosition();
        this.$.firebaseuicontainer.style.display = 'none';

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                thisMainAuth.dispatch('setCurrentUser', firebaseUser);
                thisMainAuth.dispatch('authenticateUser');
            } else {
                thisMainAuth.dispatch('deauthenticateUser');
            }
        });

        window.addEventListener('resize', () => {
            this.setupPosition();
        });

        this.loadFirebaseUI();
    }

    setupPosition() {
        const thisMainAuth = this;
        thisMainAuth.$.container.style.marginTop =
            (window.innerHeight - 294) / 2 - 100 + 'px';
        thisMainAuth.$.container.style.marginLeft =
            (window.innerWidth - 300) / 2 + 'px';

        if (window.innerWidth < 640) {
            thisMainAuth.$.container.style.marginTop =
                (window.innerHeight - 294) / 2 + 'px';
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
                    thisMainAuth.$.firebaseuicontainer.style.display = 'block';
                    thisMainAuth.$.spinner.style.display = 'none';
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
