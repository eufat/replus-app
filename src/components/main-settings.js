import {LitElement, html} from '@polymer/lit-element';

import get from 'lodash/get';
import values from 'lodash/values';

import '@polymer/paper-toggle-button';
import '@polymer/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@polymer/paper-radio-group';
import '@polymer/paper-radio-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/social-icons';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@polymer/paper-material';

import {connect} from 'pwa-helpers/connect-mixin';

import {store} from '../store.js';
import { firebase } from '../firebase.js';
import {setActiveDevice, setActiveRemotes, fetchGroup} from '../actions/remote.js';
import {linkWithProvider, notification, setGeolocation} from '../actions/app.js';
import {showBack} from '../actions/app.js';
import {log} from '../utils.js';

export default class MainSettings extends connect(store)(LitElement) {
    static get properties() {
        return {
            uid: String,
            active: Boolean,
            rooms: Array,
            currentUser: Object,
            provider: String,
            notification: Boolean,
            geolocation: Boolean,
            groups: Array,
            currentGroup: Object,
            onEdit: Boolean,
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.currentUser = {};
        this.groups = [];
        this.currentGroup = {};
        this.onEdit = false;
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _firstRendered() {
        store.dispatch(fetchGroup());
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.uid = get(state, 'app.currentUser.uid');
        this.currentUser = get(state, 'app.currentUser');
        this.notification = get(state, 'app.notification');
        this.geolocation = get(state, 'app.geolocation.state');
        this.groups = get(state, 'remote.group');
    }

    _didRender() {
        let user = firebase.auth().currentUser;

        if (user != null) {
            user.providerData.forEach((profile) => {
                this.provider = profile.providerId;
            });
        }
    }

    _activeDevice(device, remotes) {
        const arrRemotes = [];
        const remotesValues = values(remotes);
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

    _handleNotification(e) {
        if (this.notification) {
            store.dispatch(notification(true));
        } else {
            store.dispatch(notification(false));
        }
    }

    _handleGeolocation(e) {
        if (this.geolocation) {
            store.dispatch(setGeolocation(false));
        } else {
            store.dispatch(setGeolocation(true));
        }
    }

    _groupDialog(group) {
        this.shadowRoot.getElementById('edit-group-modal').open();
        this.currentGroup = group;
    }

    _onEdit() {
        this.onEdit = true;
    }

    _cancelEdit() {
        this.onEdit = false;
    }

    _save() {
        this.onEdit = false;
    }

    _render({rooms, currentUser, provider, notification, geolocation, groups, currentGroup, onEdit}) {
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
                                <div class="device-pill">
                                    <span class="pill-content">${device.name}</span>
                                </div>
                            </paper-item-body>
                            <div class="settings-right">
                                <a href="/dashboard/setting-remote" on-click="${() => this._activeDevice(device.name, rooms.remotes)}">
                                    <iron-icon class="settings-icon" icon="icons:arrow-forward">
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
                                <div class="device-pill">
                                    <span class="pill-content">${device.name}</span>
                                </div>
                            </paper-item-body>
                            <div class="settings-right">
                                <a href="/dashboard/setting-vision">
                                    <iron-icon class="settings-icon" icon="icons:arrow-forward">
                                </a>
                            </div>
                        </paper-item>
                    `;
                }
            });
        };

        const remoteValues = values(rooms);
        const remoteItems = remoteValues.map((item, roomIndex) => {
            return html`
                <paper-material elevation="0">
                    <div class="room-devices">
                        ${remoteDevices(values(item.devices), item)}
                    </div>
                </paper-material>
            `;
        });

        const cameraValues = values(rooms);
        const cameraItems = cameraValues.map((item, roomIndex) => {
            return html`
                <paper-material elevation="0">
                    <div class="room-devices">
                        ${cameraDevices(values(item.devices), item)}
                    </div>
                </paper-material>
            `;
        });

        const groupValues = values(groups);
        const groupItems = groupValues.map((item, index) => {
            return html`
                <style>
                    .group-item {
                        cursor: pointer;
                    }
                </style>
                <paper-item class="group-item" on-click="${() => this._groupDialog(item)}">
                    <paper-item-body>
                        ${item.name}
                    </paper-item-body>
                    <div class="settings-right">
                        ${item.email.length}
                        <iron-icon icon="social:person"></iron-icon>
                        ${item.room.length}
                        <iron-icon icon="icons:weekend"></iron-icon>
                    </div>
                </paper-item>
            `
        });

        const providerIsGoogle = provider === undefined ? true : provider === 'google.com';
        const providerIsFacebook = provider === undefined ? true : provider === 'facebook.com';

        let totalDevice = 0;
        let totalRemote = 0;
        const roomValues = values(rooms);
        roomValues.map((deviceItem) => {
            if (deviceItem.devices) {
                if (deviceItem.devices.length != 0) {
                    totalDevice = totalDevice + deviceItem.devices.length;
                }
                if (deviceItem.remotes.length != 0) {
                    totalRemote = totalRemote + deviceItem.remotes.length;
                }
            }
        });

        return html`
            <style>
                .container {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 0 0.8rem 5rem;
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
                .device-pill {
                    color: rgba(35, 47, 52, 1);
                    background-color: rgba(35, 47, 52, 0.12);
                    border-radius: 15px;
                    display: inline-block;
                    text-align: center;
                    padding: 0 10px;
                    width: auto;
                    height: 30px;
                    line-height: 30px;
                }
                .device-pill .pill-content, .device-pill mwc-icon {
                    vertical-align: top;
                    display: inline-block;
                }
                .settings-icon {
                    color: #333333;
                    padding-bottom: 5px;
                    cursor: pointer;
                }
                .remote-icon {
                    padding-right: 5px;
                }
                .device-type {
                    display: inline !important;
                }
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
                    --mdc-theme-on-primary: white;
                    --mdc-theme-primary: #4664ae;
                    --mdc-theme-on-secondary: white;
                    --mdc-theme-secondary: #4664ae;
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
                    font-size: 1.25rem;
                    margin-bottom: 0px !important;
                }
                .title {
                    margin-top: 0px !important;
                }

                paper-toggle-button.right {
                    margin-top: 15px !important;
                }

                paper-material.paper-container {
                    position: relative;
                    display: block;
                    border-radius: 5px;
                    background-color: white;
                    margin: 1rem 0;
                    background-color: white;
                }

                paper-item {
                    border-top: 1px solid #0000000f;
                }

                .header {
                    margin-top: 30px;
                }

                #edit-group-modal {
                    width: 500px;
                }

                @media screen and (max-width: 320px) {
                    mwc-button.mwc-edit {
                        width: 65px;
                    }
                    mwc-button.mwc-schedule {
                        width: 105px;
                    }
                    mwc-button.mwc-location {
                        width: 100px;
                    }
                }

                .group-name, .room-name {
                    position: relative;
                }

                .edit-group-button, .add-room-button {
                    position: absolute;
                    top: -5px;
                    right: 0;
                }
            </style>
            <div class="container">
                <paper-material class="paper-container" elevation="1">
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
                                <p class="left">Notification</p>
                                <paper-toggle-button class="right" checked="${notification}" on-tap="${(e) => this._handleNotification(e)}"></paper-toggle-button>
                            </paper-item-body>
                        </paper-item>
                        <paper-item>
                            <paper-item-body class="text-container">
                                <p class="left">Geolocation</p>
                                <paper-toggle-button class="right" checked="${geolocation}" on-tap="${(e) => this._handleGeolocation(e)}"></paper-toggle-button>
                            </paper-item-body>
                        </paper-item>
                    </div>
                </paper-material>
                <paper-material class="paper-container" elevation="1">
                    <div role="listbox" class="settings">
                        <paper-item>
                            <paper-item-body class="text-container">
                                <p class="left">Owner Name</p>
                                <p class="right">${get(currentUser, 'displayName')}</p>
                            </paper-item-body>
                        </paper-item>
                        <paper-item>
                            <paper-item-body class="text-container">
                                <p class="left">Owner Email</p>
                                <p class="right">${get(currentUser, 'email')}</p>
                            </paper-item-body>
                        </paper-item>
                        <paper-item>
                            <mwc-button
                                dense
                                icon="link"
                                class="light"
                                label="Link to Google"
                                disabled="${providerIsGoogle}"
                                on-click="${() => store.dispatch(linkWithProvider('google'))}"
                            ></mwc-button>
                        </paper-item>
                        <paper-item>
                            <mwc-button
                                dense
                                icon="link"
                                class="light"
                                label="Link to Facebook"
                                disabled="${providerIsFacebook}"
                                on-click="${() => store.dispatch(linkWithProvider('facebook'))}"
                            ></mwc-button>
                        </paper-item>
                    </div>
                </paper-material>
                <paper-material class="paper-container" elevation="1">
                    <div role="listbox" class="settings">
                        <paper-item>
                            <paper-item-body>
                                <div>Groups</div>
                            </paper-item-body>
                        </paper-item>
                        ${groupItems}
                        <paper-item>
                            <paper-item-body>
                                <div>Add Group</div>
                            </paper-item-body>
                            <div class="settings-right">
                                <iron-icon class="settings-icon" icon="icons:add" on-click="${() => this.shadowRoot.getElementById('add-new-group-modal').open()}">
                            </div>
                        </paper-item>
                    </div>
                </paper-material>
                <paper-material class="paper-container" elevation="1">
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
                </paper-material>
                <paper-dialog id="add-new-group-modal" with-backdrop>
                    <div class="modal-content">
                        <paper-input
                            id="groupName"
                            label="Enter Group Name"
                            always-float-label>
                        </paper-input>
                        <mwc-button dialog-confirm label="Add This Group"></mwc-button>
                    </div>
                </paper-dialog>
                <paper-dialog id="edit-group-modal" with-backdrop>
                    <div class="modal-content">
                        ${onEdit
                            ? html`
                            <paper-input
                                label="Group Name"
                                value="${currentGroup.name}"
                                always-float-label>
                            </paper-input>
                            <mwc-button
                                class="blue-button"
                                label="Save"
                                icon="save"
                                on-click="${() => this._save()}">
                            </mwc-button>
                            <mwc-button
                                class="blue-button"
                                label="Cancel"
                                icon="clear"
                                on-click="${() => this._cancelEdit()}">
                            </mwc-button>`
                            : html`
                            <div class="group-name">
                                <h3>${currentGroup.name}</h3>
                                <mwc-button
                                    dense
                                    class="edit-group-button blue-button"
                                    label="Edit"
                                    icon="edit"
                                    on-click="${() => this._onEdit()}">
                                </mwc-button>
                            </div>`
                        }
                        <h3>People</h3>
                        <paper-input
                            label="Email"
                            always-float-label>
                        </paper-input>
                        <mwc-button
                            class="blue-button"
                            label="Add"
                            icon="add">
                        </mwc-button>
                        ${values(currentGroup.email).map((email) => {
                            return html`
                                <p>${email}</p>
                            `;
                        })}
                        <h3>Room</h3>
                        ${roomValues.map((room) => {
                            return html`
                                <div class="room-name">
                                    <p>${room.name}</p>
                                    <mwc-button
                                        dense
                                        class="add-room-button blue-button"
                                        label="Add"
                                        icon="add">
                                    </mwc-button>
                                </div>
                            `;
                        })}
                    </div>
                </paper-dialog>
            </div>
    `;
    }
}

customElements.define('main-settings', MainSettings);
