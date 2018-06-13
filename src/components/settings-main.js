import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import {Button} from '@material/mwc-button/mwc-button.js';

import firebase from '../firebase.js';
import {store} from '../store.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {linkWithProvider} from '../actions/app.js';

// Import from lodash
const get = _.get;

export default class SettingsMain extends connect(store)(LitElement) {
    static get properties() {
        return {
            currentUser: Object,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.currentUser = {};
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.currentUser = get(state, 'app.currentUser');
    }

    _render({currentUser}) {
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
            </style>
            <div role="listbox" class="settings">
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
                        on-click="${() => store.dispatch(linkWithProvider('google'))}"
                    ></mwc-button>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="Link to Facebook"
                        on-click="${() => store.dispatch(linkWithProvider('facebook'))}"
                    ></mwc-button>
                </paper-item>
            </div>
    `;
    }
}

customElements.define('settings-main', SettingsMain);
