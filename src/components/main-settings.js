import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button';
import '@polymer/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@polymer/paper-radio-group';
import '@polymer/paper-radio-button';
import '@polymer/iron-icons/iron-icons';

import {store} from '../store.js';
import {connect} from 'pwa-helpers/connect-mixin';

import {fetchRooms, setActiveDevice, setActiveRemotes} from '../actions/remote.js';
import {showBack} from '../actions/app.js';

const get = _.get;

export default class MainSettings extends connect(store)(LitElement) {
    static get properties() {
        return {
            uid: String,
            active: Boolean,
            rooms: Array,
        };
    }

    constructor() {
        super();
        this.rooms = [];
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.rooms = _.get(state, 'remote.rooms');
        this.uid = _.get(state, 'app.currentUser.uid');
    }

    _activeDevice(device, remotes) {
        const arrRemotes = [];
        const remotesValues = _.values(remotes);
        remotesValues.map((item) => {
            arrRemotes.push(item.name);
        });

        store.dispatch(showBack());
        store.dispatch(setActiveDevice(device));
        store.dispatch(setActiveRemotes(arrRemotes));
    }

    _handleDeviceClick() {
        store.dispatch(showBack());
    }
    _render({rooms}) {
        const remoteDevices = (devices, rooms) => {
            return devices.map((device, index) => {
                if (device.type == 'replus-remote') {
                    return html`
                        <style>
                            .settings-icon {
                                color: #333333;
                                padding-bottom: 5px;
                            }
                            .remote-icon {
                                padding-right: 5px;
                            }
                            .device-type {
                                display: inline !important;
                            }
                        </style>
                        <paper-item>
                            <paper-item-body>
                                <iron-icon class="remote-icon" src="images/add-device.png"></iron-icon>
                                <p class="device-type">${device.type}</p>
                            </paper-item-body>
                            <div class="settings-right">
                                <div class="device-pill">
                                    <span class="pill-content">${device.name}</span>
                                </div>
                                <a href="/dashboard/setting-remote" on-click="${() => this._activeDevice(device.name, rooms.remotes)}">
                                    <iron-icon class="settings-icon" icon="icons:settings">
                                </a>
                            </div>
                        </paper-item>
                    `;
                }
            });
        };

        const cameraDevices = (devices, rooms) => {
            return devices.map((device, index) => {
                if (device.type == 'replus-vision') {
                    return html`
                        <style>
                            .settings-icon {
                                color: #333333;
                                padding-bottom: 5px;
                            }
                            .remote-icon {
                                padding-right: 5px;
                            }
                            .device-type {
                                display: inline !important;
                            }
                        </style>
                        <paper-item>
                            <paper-item-body>
                                <iron-icon class="remote-icon" src=""></iron-icon>
                                <p class="device-type">${device.type}</p>
                            </paper-item-body>
                            <div class="settings-right">
                                <div class="device-pill">
                                    <span class="pill-content">${device.name}</span>
                                </div>
                                <a href="/dashboard/setting-vision">
                                    <iron-icon class="settings-icon" icon="icons:settings">
                                </a>
                            </div>
                        </paper-item>
                    `;
                }
            });
        };

        const remoteValues = _.values(rooms);
        const remoteItems = remoteValues.map((item, roomIndex) => {
            return html`
                <paper-material elevation="0">
                    <div class="room-devices">
                        ${remoteDevices(_.values(item.devices), item)}
                    </div>
                </paper-material>
            `;
        });

        const cameraValues = _.values(rooms);
        const cameraItems = cameraValues.map((item, roomIndex) => {
            return html`
                <paper-material elevation="0">
                    <div class="room-devices">
                        ${cameraDevices(_.values(item.devices), item)}
                    </div>
                </paper-material>
            `;
        });

        return html`
        <style>
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
            .device-pill {
                color: white;
                background-color: #ccc;
                border-radius: 15px;
                display: inline-block;
                text-align: center;
                padding: 0 10px;
                width: auto;
                height: 30px;
                line-height: 30px;
                margin-right: 5px;
            }
            .device-pill .pill-content, .device-pill mwc-icon {
                vertical-align: top;
                display: inline-block;
            }
            .settings-icon {
                color: #333333;
                padding-bottom: 5px;
            }
            .remote-icon {
                padding-right: 5px;
            }
            .device-type {
                display: inline !important;
            }
        </style>
        <div role="listbox" class="settings">
            <paper-item>
                <paper-item-body>
                    <div>Replus Remote</div>
                </paper-item-body>
            </paper-item>
            ${remoteItems}
            <paper-item>
                <paper-item-body>
                    <div>Replus Vision</div>
                </paper-item-body>
            </paper-item>
            ${cameraItems}
        </div>
    `;
    }
}

customElements.define('main-settings', MainSettings);
