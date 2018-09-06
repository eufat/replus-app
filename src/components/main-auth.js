import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import '@material/mwc-button';

import firebase from '../firebase';
import errorHandler from '../error';
import {store} from '../store';
import {userDataKey} from '../utils.js';
import {setCurrentUser, authenticateUser} from '../actions/app.js';

const pick = _.pick;

export default class MainAuth extends connect(store)(LitElement) {
    constructor() {
        super();
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
        this.facebookProvider = new firebase.auth.FacebookAuthProvider();
    }

    _stateChanged() {}

    handleOnGoogleSignIn() {
        firebase.auth().signInWithRedirect(this.googleProvider);
    }

    handleOnFacebookSignIn() {
        firebase.auth().signInWithRedirect(this.facebookProvider);
    }

    _render() {
        return html`
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 100vh;
                    padding: 0 1rem;
                    max-width: 340px;
                    margin: 0 auto;
                }

                p {
                    color: #252525;
                }
                p#header {
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                }
                p#subheader {
                    margin-bottom: 1rem;
                    font-size: 1rem;
                    color: #6e6e6e;
                }

                .auth-container {
                    background-color: white;
                    border-radius: 5px;
                    overflow: auto;
                    padding: 2rem;
                }

                mwc-button.google-button {
                    margin-top: 1rem;
                    width: 100%;
                    border: 1px solid #dadce0;
                    border-radius: 5px;
                    --mdc-theme-on-primary: white;
                    --mdc-theme-primary: #4285F4;
                    --mdc-theme-on-secondary: white;
                    --mdc-theme-secondary: #4285F4;
                }

                mwc-button.google-button:hover {
                    background-color: #4285f40a;
                    border: 1px solid #d2e3fc;
                }

                mwc-button.facebook-button {
                    margin-top: 1rem;
                    width: 100%;
                    border: 1px solid #dadce0;
                    border-radius: 5px;
                    --mdc-theme-on-primary: white;
                    --mdc-theme-primary: #4267B2;
                    --mdc-theme-on-secondary: white;
                    --mdc-theme-secondary: #4267B2;
                }

                mwc-button.facebook-button:hover {
                    background-color: #4285f40a;
                    border: 1px solid #d2e3fc;
                }
            </style>
            <div class="container">
                <paper-material class="auth-container" elevation="1">
                    <p id="header">Sign in to Replus</p>
                    <p id="subheader">Use your social account to continue.</p>
                    <mwc-button class="width google-button" on-click="${() => this.handleOnGoogleSignIn()}">Continue with Google</mwc-button>
                    <mwc-button class="width facebook-button" on-click="${() => this.handleOnFacebookSignIn()}">Continue with Facebook</mwc-button>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-auth', MainAuth);
