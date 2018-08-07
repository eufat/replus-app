import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button';
import '@polymer/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@polymer/paper-radio-group';
import '@polymer/paper-radio-button';
import {Button} from '@material/mwc-button';

import firebase from '../firebase.js';
import {store} from '../store.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {linkWithProvider} from '../actions/app.js';

// Import from lodash
const get = _.get;

export default class MainAccount extends connect(store)(LitElement) {
    static get properties() {
        return {
            currentUser: Object,
            active: Boolean,
            provider: String,
            rooms: Array,
        };
    }

    constructor() {
        super();
        this.currentUser = {};
        this.rooms = [];
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.currentUser = get(state, 'app.currentUser');
        this.rooms = get(state, 'remote.rooms');
    }

    _didRender() {
        let user = firebase.auth().currentUser;

        if (user != null) {
            user.providerData.forEach((profile) => {
                this.provider = profile.providerId;
            });
        }
    }

    _render({currentUser, provider, rooms}) {
        const providerIsGoogle = provider === undefined ? true : provider === 'google.com';
        const providerIsFacebook = provider === undefined ? true : provider === 'facebook.com';

        let totalDevice = 0;
        let totalRemote = 0;
        const deviceValues = _.values(rooms);
        deviceValues.map((deviceItem) => {
            if (deviceItem.devices.length != 0) {
                totalDevice = totalDevice + deviceItem.devices.length;
            }
            if (deviceItem.remotes.length != 0) {
                totalRemote = totalRemote + deviceItem.remotes.length;
            }
        });
        console.log(totalRemote);

        return html`
            <style>
                .text-container {
                    width: 100%;
                }

                .left {
                    float: left;
                }

                .right {
                    float: right;
                }

                .light {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }

                * {
                    box-sizing: border-box;
                }

                /* Create three equal columns that floats next to each other */
                .column {
                    float: left;
                    width: 33.33%;
                }

                /* Clear floats after the columns */
                .row:after {
                    content: "";
                    display: table;
                    clear: both;
                }
                .column p {
                    text-align: center;
                }
                .total {
                    margin-bottom: 0px !important;
                }
                .title {
                    margin-top: 0px !important;
                }
            </style>
            <div role="listbox" class="settings">
                <div class="row">
                    <div class="column">
                        <p class="total">${rooms.length}</p>
                        <p class="title">Rooms</p>
                    </div>
                    <div class="column">
                        <p class="total">${totalRemote}</p>
                        <p class="title">Remotes</p>
                    </div>
                    <div class="column">
                        <p class="total">${totalDevice}</p>
                        <p class="title">Devices</p>
                    </div>
                </div>
                <paper-item>
                    <paper-item-body class="text-container">
                        <p class="left">Display Name</p>
                        <p class="right">${get(currentUser, 'displayName')}</p>
                    </paper-item-body>
                </paper-item>
                <paper-item>
                    <paper-item-body class="text-container">
                        <p class="left">Email</p>
                        <p class="right">${get(currentUser, 'email')}</p>
                    </paper-item-body>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="Link to Google"
                        disabled="${providerIsGoogle}"
                        on-click="${() => store.dispatch(linkWithProvider('google'))}"
                    ></mwc-button>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="Link to Facebook"
                        disabled="${providerIsFacebook}"
                        on-click="${() => store.dispatch(linkWithProvider('facebook'))}"
                    ></mwc-button>
                </paper-item>
            </div>
    `;
    }
}

customElements.define('main-account', MainAccount);
