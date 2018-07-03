import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';

// import {rotationsList, resolutionsList} from '../utils';
import {store} from '../store.js';
import {setSettings} from '../actions/remote.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

export default class SettingsRemote extends connect(store)(LitElement) {
    static get properties() {
        return {
            deviceName: '',
            onePushButtons: Array,
            settingsIsDisabled: Boolean,
            off: Boolean,
            restart: Boolean,
            settings: Object,
            uid: String,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.onePushButtons = ['ON', 'OFF'];
        this.settingsIsDisabled = false;
        this.settings = {
            // onePushButton: 0,
            acButton: 0,
            tvButton: 0,
            deviceName: '',
        };

        store.dispatch(setSettings(this.settings));
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.settings = _.get(state, 'remote.settings');
        this.settings.deviceName = _.get(state, 'remote.activeDevice');
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    offOrRestartIsChanged(off, restart) {
        this.settingsIsDisabled = off || restart;
    }

    handleSaveSettings() {
        console.log('save settings');
        // store.dispatch(saveSettings());
    }

    // toggleSettings(key) {
    //     this.settings = {...this.settings, [key]: !this.settings[key]};
    //     store.dispatch(setSettings(this.settings));
    // }

    changeSettings(event, key) {
        const value = event.target.name;
        this.settings = {...this.settings, [key]: value};
        store.dispatch(setSettings(this.settings));
    }

    _render({settings, onePushButtons, settingsIsDisabled}) {
        const {getIndexOf, onTurnOffDevice, handleSaveSettings, onRestartDevice} = this;

        const settingsAcButton = onePushButtons[settings.acButton];
        const settingsTvButton = onePushButtons[settings.tvButton];

        return html`
        <style>
            .settings {
                border-bottom: 1px solid #ECEFF1;
            }
            .settings-right {
                margin-left: auto;
                margin-right: 0;
            }
            paper-button.save {
                margin: 1em;
                background-color: white;
                color: black;
            }
            paper-button.save:hover {
                background-color: var(--paper-grey-50);
            }
            paper-radio-button {
                width: 100%;
                margin: 0;
            }
            .pointer {
                cursor: pointer;
            }
        </style>
        <div role="listbox" class="settings">
            <paper-item>
                <paper-item-body>
                    <div>Remote AC</div>
                </paper-item-body>
            </paper-item>
            <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('acPushButtonDialog').open()}">
                <paper-item-body>
                    <div>One Push Button</div>
                </paper-item-body>
                <div class="settings-right">
                    ${settingsAcButton}
                </div>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Remote TV</div>
                </paper-item-body>
            </paper-item>
            <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('tvPushButtonDialog').open()}">
                <paper-item-body>
                    <div>One Push Button</div>
                </paper-item-body>
                <div class="settings-right">
                    ${settingsTvButton}
                </div>
            </paper-item>
            <paper-button
                class="save"
                raised
                on-click="${() => handleSaveSettings()}">
                    Save Settings
            </paper-button>
        </div>
        <paper-dialog id="acPushButtonDialog">
            <paper-radio-group
                selected="${settings.acButton}"
                on-change="${(e) => this.changeSettings(e, 'acButton')}"
            >
                ${onePushButtons.map(
                    (item) => html`
                        <paper-radio-button
                            name="${this.getIndexOf(onePushButtons, item)}">
                                ${item}
                        </paper-radio-button>
                    `
                )}
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="tvPushButtonDialog">
            <paper-radio-group
                selected="${settings.tvButton}"
                on-change="${(e) => this.changeSettings(e, 'tvButton')}"
            >
                ${onePushButtons.map(
                    (item) => html`
                        <paper-radio-button
                            name="${this.getIndexOf(onePushButtons, item)}">
                                ${item}
                        </paper-radio-button>
                    `
                )}
            </paper-radio-group>
        </paper-dialog>
    `;
    }
}

customElements.define('settings-remote', SettingsRemote);
