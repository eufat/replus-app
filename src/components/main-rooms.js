import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@polymer/paper-input/paper-input';

import {setRooms, fetchRooms, editRoom, addRoom, removeRoom, setNewRemote, addRemote, removeRemote, addDevice, addCamera, setNewDevice, setActiveRemote, setActiveRoom} from '../actions/remote';
import {setActiveVision} from '../actions/vision';
import {getNewRoomTemplate, brandsList, toTitleCase} from '../utils';
import {store} from '../store';

const get = _.get;

export default class MainRooms extends connect(store)(LitElement) {
    static get properties() {
        return {
            rooms: Array,
            newDevice: Object,
            newRemote: Object,
            uid: String,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.newDevice = {};
        this.newRemote = {};
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.newDevice = get(state, 'remote.newDevice');
        this.newRemote = get(state, 'remote.newRemote');
        this.uid = get(state, 'app.currentUser.uid');
    }

    _enterOnEdit(roomIndex) {
        let newRooms = [...this.rooms];
        newRooms[roomIndex].onEdit = true;
        store.dispatch(setRooms(newRooms));
    }

    _exitOnEdit(roomIndex) {
        let newRooms = [...this.rooms];
        const newRoom = newRooms[roomIndex];
        if (newRoom.id === '') {
            store.dispatch(addRoom(newRoom));
        } else {
            store.dispatch(editRoom(newRoom));
        }

        newRooms[roomIndex].onEdit = false;
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
            e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
        }
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    _handleNewDeviceChange(e, key) {
        const newDevice = {...this.newDevice, [key]: e.target.value};
        store.dispatch(setNewDevice(newDevice));
    }

    _handleNewRemoteChange(e, key) {
        const value = key == 'brand' ? e.target.value : e.target.name; // kalau brand ambil valuenya, bukan name
        const newRemote = {...this.newRemote, [key]: value};
        store.dispatch(setNewRemote(newRemote));
    }

    _handleNewDeviceAdd(room) {
        store.dispatch(addDevice(room));
    }

    _handleNewRemoteAdd(roomID) {
        store.dispatch(addRemote(roomID));
    }

    _handleNewCameraAdd(roomID) {
        store.dispatch(addCamera(roomID));
    }

    _handleActiveRemote(remote) {
        store.dispatch(setActiveRemote(remote));
    }

    _handleActiveRoom(room) {
        store.dispatch(setActiveRoom(room));
    }

    _handleActiveVision(vision) {
        store.dispatch(setActiveVision(vision));
    }

    _render({rooms, newRemote, newDevice}) {
        const roomRemotes = (remotes, roomIndex) => {
            return _.mapValues(remotes, (remote) => {
                const onEdit = rooms[roomIndex].onEdit;
                const applicanceType = remote.name.split(' ')[0].toLowerCase();

                return html`
                    <style>
                        a {
                            color: black;
                            text-decoration: none;
                        }
                    </style>
                        ${
                            onEdit
                                ? html`
                                    <div class="remote-item">
                                        <mwc-button
                                            label="Remove"
                                            icon="close"
                                            on-click="${() => this._removeRemote(roomIndex, remote.id)}">
                                        </mwc-button>
                                        <img class="appliance-icon-edit" src="images/${applicanceType}-icon.png"/>
                                        <p>${toTitleCase(remote.name)}</p>
                                    </div>`
                                : html`
                                <a href="/dashboard/remote-${remote.name.substring(0, 2)}" on-click="${() => this._handleActiveRemote(remote)}">
                                    <div class="remote-item">
                                        <img class="appliance-icon" src="images/${applicanceType}-icon.png"/>
                                        <p>${toTitleCase(remote.name)}</p>
                                    </div>
                                </a>`
                        }
                `;
            });
        };

        const roomCameras = (devices, roomIndex) => {
            return devices.map((device) => {
                const onEdit = rooms[roomIndex].onEdit;

                if (device.type === 'replus-vision') {
                    return html`
                            ${
                                onEdit
                                    ? html`
                                        <div class="remote-item">
                                            <mwc-button
                                                label="Remove"
                                                icon="close"
                                                on-click="${() => this._removeDevice(roomIndex, roomIndex)}">
                                            </mwc-button>
                                            <img class="appliance-icon" src="images/cam-icon.png"/>
                                            <p>Camera ${device.name}</p>
                                        </div>`
                                    : html`
                                    <a href="/dashboard/remote-vision"  on-click="${() => this._handleActiveVision(device.name)}">
                                        <div class="remote-item">
                                            <img class="appliance-icon" src="images/cam-icon.png"/>
                                            <p>Camera ${device.name}</p>
                                        </div>
                                    </a>`
                            }
                    `;
                }
            });
        };

        const roomDevices = (devices, roomIndex) => {
            return devices.map((device, index) => {
                const onEdit = rooms[roomIndex].onEdit;

                return html`
                    <div class="device-pill">
                        <span class="pill-content">${device.name}</span>
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
                            value="${get(this.newDevice, 'deviceID')}"
                            on-input="${(e) => this._handleNewDeviceChange(e, 'deviceID')}"
                        >
                        </paper-input>
                        <paper-input
                            label="Device Activation Code"
                            always-float-label
                            value="${get(newDevice, 'deviceCode')}"
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
                            selected="${get(this.newRemote, 'type')}"
                            on-change="${(e) => this._handleNewRemoteChange(e, 'type')}"
                        >
                            <paper-radio-button name="tv">TV</paper-radio-button>
                            <paper-radio-button name="ac">AC</paper-radio-button>
                        </paper-radio-group>
                        <select
                            selected="${get(this.newRemote, 'brand')}"
                            on-change="${(e) => this._handleNewRemoteChange(e, 'brand')}"
                        >
                            ${brandsList.map((brand) => {
                                return html`
                                        <option
                                            value="${brand}"
                                        >
                                                ${toTitleCase(brand)}
                                        </option>`;
                            })}
                        </select>
                        <div class="buttons" on-click="${() => this._handleNewRemoteAdd(item.id)}">
                            <mwc-button dialog-confirm label="Add This Remote"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-camera-modal-${roomIndex}">
                    <div class="modal-content">
                        <label id="appliance-type">Add Camera: Replus Vision</label>
                        <paper-input
                            label="Device ID"
                            always-float-label
                            value="${get(this.newDevice, 'deviceID')}"
                            on-input="${(e) => this._handleNewDeviceChange(e, 'deviceID')}"
                        >
                        </paper-input>
                        <paper-input
                            label="Device Activation Code"
                            always-float-label
                            value="${get(newDevice, 'deviceCode')}"
                            on-input="${(e) => this._handleNewDeviceChange(e, 'deviceCode')}"
                        >
                        </paper-input>
                        <div class="buttons" on-click="${() => this._handleNewCameraAdd(item.id)}">
                            <mwc-button dialog-confirm label="Add This Camera"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-material elevation="1">
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
                                        label="Exit Edit"
                                        icon="close"
                                        on-click="${() => this._exitOnEdit(roomIndex)}">
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
                                        on-click="${() => this._enterOnEdit(roomIndex)}">
                                    </mwc-button>
                                    <a href="/dashboard/add-schedule" on-click="${() => this._handleActiveRoom(room)}">
                                        <mwc-button
                                            label="Schedule"
                                            icon="calendar_today">
                                        </mwc-button>
                                    </a>`
                        }
                    </div>
                    <div class="room-remotes">
                        ${_.values(roomCameras(item.devices, roomIndex))}
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

                @media screen and (max-width: 375px) {
                    .remote-item {
                        width: 100px !important;
                        height: 120px !important;
                    }
                    .camera-item {
                        width: 100px !important;
                        height: 120px !important;
                    }
                }

                @media screen and (max-width: 320px) {
                    .remote-item {
                        width: 86px !important;
                        height: 86px !important;
                    }
                    .camera-item {
                        width: 86px !important;
                        height: 86px !important;
                    }
                    .appliance-icon {
                        padding-top: 0px !important;
                    }
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

                .appliance-icon {
                    height: 50px;
                    padding-top: 15px;
                }

                .appliance-icon-edit {
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
                    padding-bottom: 50px;
                }

                paper-dialog {
                    z-index: 99999;
                    border-radius: 5px;
                }

                paper-material {
                    display: block;
                    margin: 0 0 20px;
                    padding: 10px 20px 20px;
                    background-color: white;
                }

                paper-material.add-new-room {
                    text-align: center;
                    margin: 20px;
                    padding: 10px !important;
                    border-radius: 5px;
                }
            </style>
            <div class="rooms-container">
                <div class="paper-container">
                    ${roomsItems}
                    <paper-material elevation="1" class="add-new-room">
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

customElements.define('main-rooms', MainRooms);
