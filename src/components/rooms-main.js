import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-icon/mwc-icon.js';
import '@polymer/paper-input/paper-input.js';

import {setRooms, fetchRooms, fetchDevices, addRoom, removeRoom, setNewRemote, addRemote, removeRemote, addDevice, setNewDevice} from '../actions/remote';
import {getNewRoomTemplate, brandsList, toTitleCase} from '../utils';
import {store} from '../store.js';

export default class RoomsMain extends connect(store)(LitElement) {
    static get properties() {
        return {
            rooms: Array,
            newDevice: Object,
            newRemote: Object,
            uid: String,
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.newDevice = {};
        this.newRemote = {};
    }

    _didRender(props, changedProps, prevProps) {
        if (changedProps.uid) {
            store.dispatch(fetchRooms());
            store.dispatch(fetchDevices());
        }
    };

    _stateChanged(state) {
        this.rooms = _.get(state, 'remote.rooms');
        this.newDevice = _.get(state, 'remote.newDevice');
        this.newRemote = _.get(state, 'remote.newRemote');
        this.uid = _.get(state, 'app.currentUser.uid');
    }

    _toggleOnEdit(roomIndex) {
        const prevOnEditState = this.rooms[roomIndex].onEdit;
        let newRooms = [...this.rooms];

        newRooms[roomIndex].onEdit = !prevOnEditState;
        store.dispatch(setRooms(newRooms));
    }

    _changeRoomName(e, roomIndex) {
        let newRooms = [...this.rooms];

        newRooms[roomIndex].name = e.target.value;
        store.dispatch(setRooms(newRooms));
    }

    _removeRoom(roomIndex) {
        store.dispatch(removeRoom(this.rooms[roomIndex]));
    }

    _removeRemote(roomIndex, remoteKey) {
        const room = this.rooms[roomIndex];
        const roomID = room.id;
        const remoteID = remoteKey;
        store.dispatch(removeRemote(roomID, remoteID));
    }

    _removeDevice(roomIndex, deviceIndex) {
        let newRooms = [...this.rooms];
        delete newRooms[roomIndex].devices[deviceIndex];

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

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    _handleNewDeviceChange(e, key) {
        const newDevice = {...this.newDevice, [key]: e.target.name};
        store.dispatch(setNewDevice(newDevice));
    }

    _handleNewRemoteChange(e, key) {
        const value = key == 'brand' ? e.target.value : e.target.name;
        const newRemote = {...this.newRemote, [key]: value};
        store.dispatch(setNewRemote(newRemote));
    }

    _handleNewDeviceAdd(room) {
        store.dispatch(addDevice(room));
    }

    _handleNewRemoteAdd(roomID) {
        store.dispatch(addRemote(roomID));
    }

    _render({rooms, newRemote, newDevice}) {
        const roomRemotes = (remotes, roomIndex) => {
            return _.mapValues(remotes, (remoteValue, remoteKey, remoteObj) => {
                const onEdit = rooms[roomIndex].onEdit;
                const applicanceType = remoteValue.split(' ')[0].toLowerCase();

                return html`
                    <div class="remote-item">
                        ${
                            onEdit
                                ? html`
                                    <mwc-button
                                        label="Remove"
                                        icon="close"
                                        on-click="${() => this._removeRemote(roomIndex, remoteKey)}">
                                    </mwc-button>`
                                : null
                        }
                        <img class="appliance-icon" src="images/${applicanceType}-icon.png"/>
                        <p>${toTitleCase(remoteValue)}</p>
                    </div>
                `;
            });
        };

        const roomCameras = (cameras, roomIndex) => {
            return _.mapValues(cameras, (cameraValue, cameraKey, cameraObj) => {
                const onEdit = rooms[roomIndex].onEdit;

                return html`
                    <div class="camera-item">
                        ${
                            onEdit
                                ? html`
                                    <mwc-button
                                        label="Remove"
                                        icon="close"
                                        on-click="${() => this._removeRemote(roomIndex, cameraKey)}">
                                    </mwc-button>`
                                : null
                        }
                        <img class="appliance-icon" src="images/cam-icon.png"/>
                        <p>${toTitleCase(cameraValue)}</p>
                    </div>
                `;
            });
        };

        const roomDevices = (devices, roomIndex) => {
            return devices.map((device, index) => {
                const onEdit = rooms[roomIndex].onEdit;

                return html`
                    <div class="device-pill">
                        <span class="pill-content">${device.id}</span>
                        ${
                            onEdit
                                ? html`
                                    <mwc-icon
                                        on-click="${() => this._removeDevice(roomIndex, index)}">
                                        close
                                    </mwc-icon>`
                                : null
                        }
                    </div>
                `;
            });
        };

        const roomsValues = _.values(rooms);
        const roomsItems = roomsValues.map((item, roomIndex) => {
            const room = rooms[roomIndex];
            const onEdit = room.onEdit;

            return html`
                <paper-dialog id="add-new-device-modal-${roomIndex}">
                    <div class="modal-content">
                        <paper-input
                            label="Device ID"
                            always-float-label
                            value="${_.get(this.newDevice, 'deviceID')}"
                            on-input="${(e) => this._handleNewDeviceChange(e, 'deviceID')}"
                        >
                        </paper-input>
                        <paper-input
                            label="Device Activation Code"
                            always-float-label
                            value="${_.get(newDevice, 'deviceCode')}"
                            on-input="${(e) => this._handleNewDeviceChange(e, 'deviceCode')}"
                        >
                        </paper-input>
                        <div class="buttons" on-click="${() => this._handleNewDeviceAdd(room)}">
                            <mwc-button dialog-confirm label="Add This Device"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-remote-modal-${roomIndex}">
                    <div class="modal-content">
                        <label id="appliance-type">Choose Remote:</label>
                        <paper-radio-group
                            aria-labelledby="appliance-type"
                            selected="${_.get(this.newRemote, 'type')}"
                            on-change="${(e) => this._handleNewRemoteChange(e, 'type')}"
                        >
                            <paper-radio-button name="tv">TV</paper-radio-button>
                            <paper-radio-button name="ac">AC</paper-radio-button>
                        </paper-radio-group>
                        <select
                            selected="${_.get(this.newRemote, 'brand')}"
                            on-change="${(e) => this._handleNewRemoteChange(e, 'brand')}"
                        >
                            ${
                                brandsList.map((brand) => {
                                    return html`
                                        <option
                                            value="${brand}"
                                        >
                                                ${toTitleCase(brand)}
                                        </option>`;
                                })
                            }
                        </select>
                        <div class="buttons" on-click="${() => this._handleNewRemoteAdd(item.id)}">
                            <mwc-button dialog-confirm label="Add This Remote"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-camera-modal-${roomIndex}">
                    <div class="modal-content">
                        <label id="appliance-type">Add Camera: Replus Vision</label>
                        <div class="buttons" on-click="${() => this._handleNewCameraAdd(item.id)}">
                            <mwc-button dialog-confirm label="Add This Camera"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-material>
                    <div class="room-title">
                        ${
                            onEdit
                                ? html`
                                    <paper-input
                                        on-input="${(e) => this._changeRoomName(e, roomIndex)}"
                                        value="${item.name}"
                                        label="Enter Room Name"
                                        always-float-label>
                                    </paper-input>
                                    <mwc-button
                                        label="Close Edit"
                                        icon="close"
                                        on-click="${() => this._toggleOnEdit(roomIndex)}">
                                    </mwc-button>
                                    <mwc-button
                                        label="Delete Room"
                                        icon="delete"
                                        on-click="${() => this._removeRoom(roomIndex)}">
                                    </mwc-button>`
                                : html`
                                    <h1>${item.name}</h1>
                                    <mwc-button
                                        label="Edit"
                                        icon="edit"
                                        on-click="${() => this._toggleOnEdit(roomIndex)}">
                                    </mwc-button>`
                        }
                    </div>
                    <div class="room-remotes">
                        ${_.values(roomCameras(item.cameras, roomIndex))}
                        ${_.values(roomRemotes(item.remotes, roomIndex))}
                        ${
                            onEdit
                                ? html`
                                    <div
                                        class="remote-item"
                                        on-click="${() => this.shadowRoot.getElementById(`add-new-remote-modal-${roomIndex}`).open()}">
                                        <img class="appliance-icon" src="images/add-plus-button.png"/>
                                        <p>Add Remote</p>
                                    </div>`
                                : null
                        }
                        ${
                            onEdit
                                ? html`
                                    <div
                                        class="camera-item"
                                        on-click="${() => this.shadowRoot.getElementById(`add-new-camera-modal-${roomIndex}`).open()}">
                                        <img class="appliance-icon" src="images/add-plus-button.png"/>
                                        <p>Add Camera</p>
                                    </div>`
                                : null
                        }
                    </div>
                    <div class="room-devices">
                        ${roomDevices(_.values(item.devices), roomIndex)}
                        ${
                            onEdit
                                ? html`
                                    <mwc-button
                                        label="Add device"
                                        icon="add"
                                        on-click="${() => this.shadowRoot.getElementById(`add-new-device-modal-${roomIndex}`).open()}">
                                    </mwc-button>`
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

                .remote-item, .camera-item {
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

                .remote-item:hover, .camera-item:hover {
                    background-color: #f5f5f5;
                    cursor: pointer;
                }

                .remote-item p, .camera-item p  {
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
                        <mwc-button
                            label="Add new room"
                            icon="add"
                            on-click="${() => this._addNewRoom()}">
                        </mwc-button>
                    </paper-material>
                </div>
            </div>
    `;
    }
}

customElements.define('rooms-main', RoomsMain);
