import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-spinner/paper-spinner';
import '@polymer/paper-button/paper-button';
import {firebaseConfig} from './configs';

class MainAuth extends PolymerElement {
    static get properties() {
        return {
            displayName: {
                type: String,
                notify: true,
            },

            email: {
                type: String,
                notify: true,
            },

            isLoggedIn: {
                type: Number,
                notify: true,
            },

            photoUrl: {
                type: String,
                notify: true,
            },

            trigger: {
                type: Number,
                observer: '_triggerLogout',
            },

            uid: {
                type: String,
                notify: true,
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
                this.uid = firebaseUser.uid;
                this.displayName = firebaseUser.displayName;
                this.email = firebaseUser.email;
                this.photoUrl = firebaseUser.photoURL;
                this.isLoggedIn = 1;
                this.$.ajax.generateRequest();
            } else {
                this.isLoggedIn = 0;
            }
        });

        window.addEventListener('resize', () => {
            this.setupPosition();
        });

        this.loadFirebaseUI();
    }

    _triggerLogout() {
        firebase.auth().signOut();
        firebaseUI.start('#firebaseuicontainer', uiConfig);
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
        console.log('rs-auth: loadFirebaseUI');
        const uiConfig = {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                {
                    provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    scopes: ['public_profile', 'email'],
                },
            ],
            callbacks: {
                signInSuccess: (currentUser, credential, redirectUrl) => {
                    return false;
                },
                uiShown: () => {
                    console.log('rs-auth: FirebaseUI ready');
                    thisMainAuth.$.firebaseuicontainer.style.display = 'block';
                    thisMainAuth.$.spinner.style.display = 'none';
                },
            },
            tosUrl: '/dashboard',
        };

        const ui = new firebaseui.auth.AuthUI(firebase.auth());

        ui.start(thisMainAuth.$.firebaseuicontainer, uiConfig);
    }

    _handleResponse() {
        // console.log(`main-auth: POST request ${thisMainAuth.response}`)
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
            <iron-ajax
                id="ajax"
                url="https://core.replus.co/api/user-register"
                method="POST"
                body='uid={{uid}}&name={{displayName}}&email={{email}}'
                handle-as="text"
                last-response="{{response}}"
                on-response="_handleResponse">
            </iron-ajax>
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
