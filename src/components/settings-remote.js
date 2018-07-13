import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

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
import {brandsList, toTitleCase} from '../utils.js';

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
        this.deviceName = _.get(state, 'remote.activeDevice');
        this.remotes = _.get(state, 'remote.activeRemotes');
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
    }

    setSelectedPushButton(button) {
        this.selectedPushButton = button;
    }

    setCommand(element) {
        this.command = this.selectedRemote + ' ' + this.selectedPushButton;
        const listboxButton = element.getElementById('listbox-button');
        const listboxRemote = element.getElementById('listbox-remote');
        listboxButton.selected = null;
        listboxRemote.selected = null;
    }

    _render({remotes, onePushButtons, command, settingsIsDisabled}) {
        return html`
        <style include="iron-flex iron-flex-alignment">
            :host {
                display: block;
            }
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
            #container {
                width: 400px;
                margin-left: calc((100vw - 400px) / 2);
                padding-bottom: 150px;
            }
            #dropdownType {
                width: 21%;
                margin-right: 10px;
            }
            #dropdownBrand {
                width: 75%;
            }
            #dropdownPushButton {
                width: 100%;
            }
            #remoteDialog {
                width: 400px;
            }
            @media (max-width: 500px) {
                #container {
                    width: 280px;
                    margin-left: calc((100vw - 280px) / 2);
                }
            }
        </style>
        <div role="listbox" class="settings">
            <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('remoteDialog').open()}">
                <paper-item-body>
                    <div>One Push Button</div>
                </paper-item-body>
                <div class="settings-right">
                    ${toTitleCase(command)}
                </div>
            </paper-item>
            <paper-button
                class="save"
                raised
                on-click="${() => this.handleSaveSettings()}">
                    Save Settings
            </paper-button>
        </div>
        <paper-dialog id="remoteDialog">
            <div class="horizontal layout">
                <paper-dropdown-menu id="dropdownPushButton" label="Remote" noink no-animations>
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
                <paper-dropdown-menu id="dropdownPushButton" label="One Push Button" noink no-animations>
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
                <mwc-button on-click="${() => this.setCommand(this.shadowRoot)}" dialog-confirm label="Add This Setting"></mwc-button>
            </div>
        </paper-dialog>
    `;
    }
}

customElements.define('settings-remote', SettingsRemote);
