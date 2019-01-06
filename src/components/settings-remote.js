import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import get from 'lodash/get';

import '@polymer/paper-toggle-button';
import '@polymer/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@polymer/paper-radio-group';
import '@polymer/paper-radio-button';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';

// import {rotationsList, resolutionsList} from '../utils';
import {store} from '../store.js';
import {addSetting, setSettings} from '../actions/remote.js';
import {toTitleCase} from '../utils.js';

export default class SettingsRemote extends connect(store)(LitElement) {
    static get properties() {
        return {
            deviceName: '',
            remotes: Array,

            onePushButtons: Array,
            selectedRemote: String,
            selectedPushButton: String,
            command: String,

            settingsIsDisabled: Boolean,
            off: Boolean,
            restart: Boolean,
            uid: String,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.onePushButtons = ['ON', 'OFF'];
        this.settingsIsDisabled = false;
        this.deviceName = '';
        this.selectedRemote = '';
        this.selectedPushButton = '';
        this.command = '';
        this.remotes = [];
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.deviceName = get(state, 'remote.activeDevice');
        this.remotes = get(state, 'remote.activeRemotes');
        this.command = '';
    }

    _didRender() {
        const saveSettings = this.shadowRoot.getElementById('saveSettings');
        if (this.command != '') {
            saveSettings.removeAttribute('disabled');
        } else {
            saveSettings.setAttribute('disabled', true);
        }
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    offOrRestartIsChanged(off, restart) {
        this.settingsIsDisabled = off || restart;
    }

    handleSaveSettings() {
        store.dispatch(addSetting(this.command, this.deviceName));
        this.command = '';
        this.selectedRemote = '';
        this.selectedPushButton = '';
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

    setSelectedRemote(remote) {
        this.selectedRemote = remote;
        const dropdownRemoteButton = this.shadowRoot.getElementById('dropdownPushButton');
        dropdownRemoteButton.removeAttribute('disabled');
    }

    setSelectedPushButton(button) {
        this.selectedPushButton = button;
        const saveButton = this.shadowRoot.getElementById('saveButton');
        saveButton.removeAttribute('disabled');
    }

    setCommand(element) {
        this.command = this.selectedRemote + ' ' + this.selectedPushButton;
        const listboxButton = element.getElementById('listbox-button');
        const listboxRemote = element.getElementById('listbox-remote');
        const dropdownPushButton = this.shadowRoot.getElementById('dropdownPushButton');
        const saveButton = this.shadowRoot.getElementById('saveButton');
        listboxButton.selected = null;
        listboxRemote.selected = null;
        dropdownPushButton.setAttribute('disabled', true);
        saveButton.setAttribute('disabled', true);
    }

    _render({remotes, onePushButtons, command, deviceName, settingsIsDisabled}) {
        return html`
        <style include="iron-flex iron-flex-alignment">
            :host {
                display: block;
            }
            .settings {
                border-bottom: 1px solid #0000000f;
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
            .container {
                max-width: 680px;
                margin: 0 auto;
                padding: 0 0.8rem 5rem;
            }
            paper-material.paper-container {
                position: relative;
                display: block;
                border-radius: 5px;
                background-color: white;
                margin: 1rem 0;
                background-color: white;
            }
            .header {
                margin-top: 15px;
            }
            paper-item {
                border-top: 1px solid #0000000f;
            }
            .text-container {
                width: 100%;
            }
            .dropdown-button {
                width: 100%;
            }
            #remoteDialog {
                width: 400px;
            }
            .wide {
                width: 100%;
                height: 36px;
            }
            .light-button {
                --mdc-theme-on-primary: black;
                --mdc-theme-primary: white;
                --mdc-theme-on-secondary: black;
                --mdc-theme-secondary: white;
            }
        </style>
        <div class="container">
            <div class="header">Device ${deviceName}</div>
            <paper-material class="paper-container" elevation="1">
                <div role="listbox" class="settings">
                    <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('remoteDialog').open()}">
                        <paper-item-body>
                            <div>One Push Button</div>
                        </paper-item-body>
                        <div class="settings-right">
                            ${toTitleCase(command)}
                        </div>
                    </paper-item>
                </div>
            </paper-material>
            <paper-material class="paper-container" elevation="1">
                <div role="listbox" class="settings">
                    <paper-button
                        id="saveSettings"
                        class="wide light-button"
                        on-click="${() => this.handleSaveSettings()}">Save Settings
                    </paper-button>
                </div>
            </paper-material>
        </div>
        <paper-dialog id="remoteDialog" with-backdrop>
            <div class="horizontal layout">
                <paper-dropdown-menu id="dropdownRemote" class="dropdown-button" label="Remote" noink no-animations>
                    <paper-listbox id="listbox-remote" slot="dropdown-content" class="dropdown-content">
                        ${remotes.map(
                            (item) => html`
                                <paper-item on-click="${() => this.setSelectedRemote(item)}" item-name="${this.getIndexOf(remotes, item)}">
                                    ${toTitleCase(item)}
                                </paper-item>
                            `
                        )}
                    </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="dropdownPushButton" class="dropdown-button" label="One Push Button" disabled noink no-animations>
                    <paper-listbox id="listbox-button" slot="dropdown-content" class="dropdown-content">
                        ${onePushButtons.map(
                            (item) => html`
                                <paper-item on-click="${() => this.setSelectedPushButton(item)}">
                                    ${item}
                                </paper-item>
                            `
                        )}
                    </paper-listbox>
                </paper-dropdown-menu>
            </div>
            <div class="buttons">
                <paper-button
                    id="saveButton"
                    class="mwc-edit"
                    on-click="${() => this.setCommand(this.shadowRoot)}" dialog-confirm disabled>Add This Setting
                </paper-button>
            </div>
        </paper-dialog>
    `;
    }
}

customElements.define('settings-remote', SettingsRemote);
