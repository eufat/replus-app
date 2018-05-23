import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-icon/mwc-icon.js';
import '@polymer/paper-input/paper-input.js';

import {setRooms, addRoom} from '../actions/remote';
import {getNewRoomTemplate, getRoomsDummy} from '../utils';
import {store} from '../store.js';

export default class RemoteRooms extends connect(store)(LitElement) {
    static get properties() {
        return {
            rooms: Array,
            uid: String,
            newDevice: Object,
            newRemote: Object,
        };
    }

    constructor() {
        super();
        store.dispatch(setRooms(getRoomsDummy()));
    }

    _stateChanged(state) {
        this.rooms = _.get(state, 'remote.rooms');
        this.uid = _.get(state, 'app.currentUser.uid');
    }

    _toggleOnEdit(roomIndex) {
        const prevOnEditState = this.rooms[roomIndex].onEdit;
        let newRooms = [...this.rooms];

        newRooms[roomIndex].onEdit = !prevOnEditState;
        store.dispatch(setRooms(newRooms));
    }

    _saveChanges(roomIndex) {
        this._toggleOnEdit(roomIndex);
        const room = this.rooms[roomIndex];
        const uid = this.uid;
        store.dispatch(addRoom({uid, room}));
    }

    _changeRoomName(e, roomIndex) {
        let newRooms = [...this.rooms];

        newRooms[roomIndex].name = e.target.value;
        store.dispatch(setRooms(newRooms));
    }

    _removeRoom(roomIndex) {
        let newRooms = [...this.rooms];
        newRooms.splice(roomIndex, 1);

        store.dispatch(setRooms(newRooms));
    }

    _removeRemote(roomIndex, remoteKey) {
        let newRooms = [...this.rooms];
        delete newRooms[roomIndex].remotes[remoteKey];

        store.dispatch(setRooms(newRooms));
    }

    _removeDevice(roomIndex, deviceKey) {
        let newRooms = [...this.rooms];
        delete newRooms[roomIndex].devices[deviceKey];

        store.dispatch(setRooms(newRooms));
    }

    _addNewRoom() {
        let newRooms = [...this.rooms, getNewRoomTemplate()];
        store.dispatch(setRooms(newRooms));
    }

    _patchOverlay(e) {
        if (e.target.withBackdrop) {
            e.target.parentNode.insertBefore(
                e.target.backdropElement,
                e.target
            );
        }
    }

    _handleBrandSelect(e) {
        store.dispatch(setRooms(newRooms));
    }

    _render({rooms, newRemote, newDevice}) {
        const roomRemotes = (remotes, roomIndex, brandSelected) =>
            _.values(
                _.mapValues(remotes, (remoteValue, remoteKey) => {
                    const onEdit = rooms[roomIndex].onEdit;
                    const applicanceType = remoteValue
                        .split(' ')[0]
                        .toLowerCase();

                    return html`
                        <div class="remote-item">
                            ${
                                onEdit
                                    ? html`<mwc-button label="Remove" icon="close" on-click="${() =>
                                          this._removeRemote(
                                              roomIndex,
                                              remoteKey
                                          )}"></mwc-button>`
                                    : null
                            }
                            <img class="appliance-icon" src="images/${applicanceType}-icon.png"/>
                            <p>${remoteValue}</p>
                        </div>
                    `;
                })
            );

        const roomDevices = (devices, roomIndex) =>
            _.values(
                _.mapValues(devices, (deviceId, deviceKey) => {
                    const onEdit = rooms[roomIndex].onEdit;

                    return html`
                        <div class="device-pill">
                            <span class="pill-content">${deviceId}</span>
                            ${
                                onEdit
                                    ? html`<mwc-icon on-click="${() =>
                                          this._removeDevice(
                                              roomIndex,
                                              deviceKey
                                          )}">close</mwc-icon>`
                                    : null
                            }
                        </div>
                    `;
                })
            );

        const roomsValues = _.values(rooms);
        const roomsItems = roomsValues.map((item, roomIndex) => {
            const onEdit = rooms[roomIndex].onEdit;

            return html`
                <paper-dialog id="add-new-device-modal">
                    <div class="modal-content">
                        <paper-input label="Device ID" always-float-label>
                        </paper-input>
                        <paper-input label="Device Activation Code" always-float-label>
                        </paper-input>
                        <div class="buttons">
                            <mwc-button dialog-confirm label="Add This Device"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-remote-modal">
                    <div class="modal-content">
                        <label id="appliance-type">Appliance Type:</label>
                        <paper-radio-group aria-labelledby="appliance-type">
                            <paper-radio-button name="tv">TV</paper-radio-button>
                            <paper-radio-button name="ac">AC</paper-radio-button>
                        </paper-radio-group>
                        <paper-dropdown-menu label="Brand">
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="item-name"
                            selected="${_.get(newRemote, 'brand')}"
                            on-select="${(event) =>
                                this._handleBrandSelect(event, roomIndex)}">
                            <paper-item item-name="samsung">Samsung</paper-item>
                            <paper-item item-name="lg">LG</paper-item>
                            <paper-item item-name="panasonic">Panasonic</paper-item>
                            <paper-item item-name="toshiba">Toshiba</paper-item>
                            <paper-item item-name="mitsubishi">Mitsubishi</paper-item>
                            <paper-item item-name="daikin">Daikin</paper-item>
                            <paper-item item-name="dast">Dast</paper-item>
                        </paper-listbox>
                        </paper-dropdown-menu>
                        <div class="buttons">
                            <mwc-button dialog-confirm label="Add This Remote"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-material>
                    <div class="room-title">
                        ${
                            onEdit
                                ? html`
                                    <paper-input on-input="${(e) =>
                                        this._changeRoomName(
                                            e,
                                            roomIndex
                                        )}" value="${
                                      item.name
                                  }" label="Enter Room Name" always-float-label></paper-input>
                                    <mwc-button label="Save Changes" icon="save" on-click="${() =>
                                        this._saveChanges(
                                            roomIndex
                                        )}"></mwc-button>
                                    <mwc-button label="Delete Room" icon="delete" on-click="${() =>
                                        this._removeRoom(
                                            roomIndex
                                        )}"></mwc-button>`
                                : html`
                                    <h1>${item.name}</h1>
                                    <mwc-button label="Edit" icon="edit" on-click="${() =>
                                        this._toggleOnEdit(
                                            roomIndex
                                        )}"></mwc-button>`
                        }
                    </div>
                    <div class="room-remotes">
                        ${roomRemotes(item.remotes, roomIndex)}
                        ${
                            onEdit
                                ? html`<div class="remote-item" on-click="${() =>
                                      this.shadowRoot
                                          .getElementById(
                                              'add-new-remote-modal'
                                          )
                                          .open()}">
                                    <img class="appliance-icon" src="images/add-plus-button.png"/>
                                    <p>Add Remote</p>
                                </div>`
                                : null
                        }
                    </div>
                    <div class="room-devices">
                        ${roomDevices(item.devices, roomIndex)}
                        ${
                            onEdit
                                ? html`<mwc-button label="Add device" icon="add" on-click="${() =>
                                      this.shadowRoot
                                          .getElementById(
                                              'add-new-device-modal'
                                          )
                                          .open()}"></mwc-button>`
                                : null
                        }
                    </div>
                </paper-material>
            `;
        });

        return html`
            <style>
                img {
                    user-drag: none;
                    user-select: none;
                    -moz-user-select: none;
                    -webkit-user-drag: none;
                    -webkit-user-select: none;
                    -ms-user-select: none;
                }

                #container {
                    display: block;
                    margin: 100px;
                }

                .room-title paper-button, .room-title h1 {
                    display: inline-block;
                }

                .room-title h1 {
                    font-weight: normal;
                    font-size: 1.25em;
                }

                .room-remotes {
                    width: 100%;
                    display: block;
                }

                .remote-item {
                    text-align: center;
                    display: inline-block;
                    vertical-align: top;
                    padding: 10px;
                    width: 120px;
                    height: 120px;
                    margin-top: 0;
                    margin-right: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                }

                .remote-item:hover {
                    background-color: #f5f5f5;
                    cursor: pointer;
                }

                .remote-item p {
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

                .add-new-room {
                    text-align: center;

                }

                .appliance-icon {
                    height: 50px;
                }

                .add-new-room-icon {
                    font-size: 4em;
                }

                h2 {
                    margin: 0;
                    font-size: 1.25em;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;

                }

                paper-dialog {
                    z-index: 99999;
                    border-radius: 5px;
                }

                paper-material {
                    display: block;
                    margin: 20px;
                    padding: 10px 20px;
                    background-color: white;

                }
            </style>
            <div class="rooms-container">
                <div class="paper-container">
                ${roomsItems}
                <paper-material class="add-new-room">
                    <mwc-button label="Add new room" icon="add" on-click="${() =>
                        this._addNewRoom()}"></mwc-button>
                </paper-material>
                </div>
            </div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
