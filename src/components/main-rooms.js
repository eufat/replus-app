import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import get from 'lodash/get';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';

import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-fab';
import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/image-icons';

import {setRooms, removeDevice, editRoom, addRoom, removeRoom, setNewRemote, addRemote, removeRemote, addDevice, addCamera, setNewDevice, setActiveRemote, setActiveRoom} from '../actions/remote.js';
import {setActiveVision} from '../actions/vision.js';
import {getNewRoomTemplate, brandsAC, brandsTV, toTitleCase} from '../utils.js';
import {store} from '../store.js';

export default class MainRooms extends connect(store)(LitElement) {
    static get properties() {
        return {
            _progress: Boolean,
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

    _didRender() {
        this._setButton();
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.newDevice = get(state, 'remote.newDevice');
        this.newRemote = get(state, 'remote.newRemote');
        this.uid = get(state, 'app.currentUser.uid');
        this._progress = get(state, 'app.progressOpened');
    }

    _setButton() {
        const rooms = values(this.rooms);
        rooms.map((item, index) => {
            const nextButton = this.shadowRoot.getElementById(`next-slide-${index}`);
            const prevButton = this.shadowRoot.getElementById(`prev-slide-${index}`);
            const remotes = this.shadowRoot.getElementById(`remotes-${index}`);
            let hasHorizontalScrollbar;

            if (nextButton != null || prevButton != null) {
                if (item.onEdit == true) {
                    nextButton.style.top = '150px';
                    prevButton.style.top = '150px';
                } else {
                    nextButton.style.top = '130px';
                    prevButton.style.top = '130px';
                }
            }

            if (remotes != null) {
                hasHorizontalScrollbar = remotes.scrollWidth > remotes.clientWidth;
            }

            if (nextButton != undefined) {
                if (hasHorizontalScrollbar) {
                    const maxScrollLeft = remotes.scrollWidth - remotes.clientWidth;
                    nextButton.style.display = 'block';
                    if (remotes.scrollLeft == maxScrollLeft) {
                        nextButton.style.display = 'none';
                    }
                } else {
                    nextButton.style.display = 'none';
                    prevButton.style.display = 'none';
                }
            }
        });
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

    _removeRemote(remoteID) {
        store.dispatch(removeRemote(remoteID));
    }

    _removeDevice(device) {
        store.dispatch(removeDevice(device));
    }

    _addNewRoom() {
        const roomName = this.shadowRoot.getElementById('roomName').value;
        const newRoom = getNewRoomTemplate(roomName);
        store.dispatch(addRoom(newRoom));
        this.shadowRoot.getElementById('roomName').value = '';
    }

    _patchOverlay(e) {
        if (e.target.withBackdrop) {
            e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
        }
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    _setBrandList(e, room) {
        const remoteType = e.target.name;
        const brandTV = 'tv-brandlist-' + room;
        const brandAC = 'ac-brandlist-' + room;
        if (remoteType == 'ac') {
            this.shadowRoot.getElementById(brandTV).style.display = 'none';
            this.shadowRoot.getElementById(brandAC).style.display = 'inline-block';
        } else {
            this.shadowRoot.getElementById(brandAC).style.display = 'none';
            this.shadowRoot.getElementById(brandTV).style.display = 'inline-block';
        }
    }

    _handleNewDeviceChange(e, key) {
        const newDevice = {...this.newDevice, [key]: e.target.value};
        store.dispatch(setNewDevice(newDevice));
    }

    _handleNewRemoteChange(e, key, room) {
        let value = key == 'brand' ? e.target.value : e.target.name; // kalau brand ambil valuenya, bukan name
        if (value == 'mitsubishi heavy industries') value = 'mitsubishi';
        let newRemote = {...this.newRemote, [key]: value};
        if (key == 'type') {
            const ac = 'ac-brandlist-' + room;
            const tv = 'tv-brandlist-' + room;
            const brandAC = this.shadowRoot.getElementById(ac).value;
            const brandTV = this.shadowRoot.getElementById(tv).value;
            if (value == 'ac') {
                newRemote = {brand: brandAC, type: value};
            } else if (value == 'tv') {
                newRemote = {brand: brandTV, type: value};
            }
        }
        store.dispatch(setNewRemote(newRemote));
    }

    _handleNewDeviceAdd(room) {
        store.dispatch(addDevice(room));
    }

    _handleNewRemoteAdd(roomID, roomIndex) {
        const ac = this.shadowRoot.getElementById(`ac-selected-${roomIndex}`);
        const tv = this.shadowRoot.getElementById(`tv-selected-${roomIndex}`);
        ac.selected = 0;
        tv.selected = 0;
        store.dispatch(addRemote(roomID));
    }

    _initialRemoteAdd(room) {
        const brandAC = 'ac-brandlist-' + room;
        const brandTV = 'tv-brandlist-' + room;
        const selectedAC = 'ac-selected-' + room;
        const selectedTV = 'tv-selected-' + room;
        this.shadowRoot.getElementById(selectedAC).selected = brandsAC[0];
        this.shadowRoot.getElementById(selectedTV).selected = brandsTV[0];
        this.shadowRoot.getElementById(brandAC).style.display = 'none';
        this.shadowRoot.getElementById(brandTV).style.display = 'inline';
    }

    _handleNewCameraAdd(roomID) {
        store.dispatch(addCamera(roomID));
    }

    _handleActiveRemote(remote) {
        store.dispatch(setActiveRemote(remote));
    }

    _handleActiveRoom(room, index) {
        const activeRoom = {index, ...room};
        store.dispatch(setActiveRoom(activeRoom));
    }

    _handleActiveVision(vision) {
        store.dispatch(setActiveVision(vision));
    }

    _scrollLeft(roomIndex, button) {
        const remotes = this.shadowRoot.getElementById(`remotes-${roomIndex}`);
        const remoteItem = this.shadowRoot.getElementById(`remote-${roomIndex}0`);
        const remoteWidth = remoteItem.offsetWidth;
        if (button == 'right') {
            remotes.scrollLeft += remoteWidth + 12;
        } else if (button == 'left') {
            remotes.scrollLeft -= remoteWidth + 12;
        }
    }

    _scroll(e, roomIndex) {
        const remote = e.target;
        const maxScrollLeft = remote.scrollWidth - remote.clientWidth;
        const nextButton = this.shadowRoot.getElementById(`next-slide-${roomIndex}`);
        const prevButton = this.shadowRoot.getElementById(`prev-slide-${roomIndex}`);
        if (remote.scrollLeft == maxScrollLeft) {
            nextButton.style.display = 'none';
        } else if (remote.scrollLeft == 0) {
            prevButton.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
        }
    }

    _render({rooms, newRemote, newDevice, _progress}) {
        const roomRemotes = (remotes, roomIndex) => {
            return mapValues(remotes, (remote) => {
                const onEdit = rooms[roomIndex].onEdit;
                const applicanceType = remote.name.split(' ')[0].toLowerCase();

                return html`
                    <style>
                        a {
                            color: black;
                            text-decoration: none;
                        }
                        .remove-button {
                            display: flex;
                        }
                    </style>
                        ${
                            onEdit
                                ? html`
                                    <div id="remote-${roomIndex}${remotes.indexOf(remote)}" class="remote-item">
                                        <mwc-button
                                            class="remove-button blue-button"
                                            label="Remove"
                                            icon="close"
                                            on-click="${() => this._removeRemote(remote.id)}">
                                        </mwc-button>
                                        <img class="appliance-icon-edit" src="images/${applicanceType}-icon.png"/>
                                        <p>${toTitleCase(remote.name)}</p>
                                    </div>`
                                : html`
                                <a href="/dashboard/remote-${remote.name.substring(0, 2)}" on-click="${() => this._handleActiveRemote(remote)}">
                                    <div id="remote-${roomIndex}${remotes.indexOf(remote)}" class="remote-item">
                                        <img class="appliance-icon" src="images/${applicanceType}-icon.png"/>
                                        <p>${toTitleCase(remote.name)}</p>
                                    </div>
                                </a>`
                        }
                `;
            });
        };

        const addRemote = (onEdit, roomIndex) => {
            return html`${
                onEdit
                    ? html`
                        <div
                            class="remote-item"
                            on-click="${() => this.shadowRoot.getElementById(`add-new-remote-modal-${roomIndex}`).open()}">
                            <img class="appliance-icon" src="images/add-plus-button.png"/>
                            <p>Add Remote</p>
                        </div>`
                    : null
            }`;
        };

        const roomCameras = (devices, roomIndex) => {
            if (devices) {
                return devices.map((device) => {
                    const onEdit = rooms[roomIndex].onEdit;

                    if (device.type === 'replus-vision') {
                        if (onEdit) {
                            return html`
                                <div class="remote-item">
                                    <mwc-button
                                        label="Remove"
                                        icon="close"
                                        class="blue-button"
                                        on-click="${() => this._removeDevice(device.name)}">
                                    </mwc-button>
                                    <img class="appliance-icon" src="images/cam-icon.png"/>
                                    <p>Camera ${device.name}</p>
                                </div>`;
                        } else {
                            return html`
                                <a href="/dashboard/remote-vision"  on-click="${() => this._handleActiveVision(device.name)}">
                                    <div class="remote-item">
                                        <img class="appliance-icon" src="images/cam-icon.png"/>
                                        <p>Camera ${device.name}</p>
                                    </div>
                                </a>`;
                        }
                    }
                });
            }
        };

        const addCamera = (onEdit, roomIndex) => {
            return html`<div> ${
                onEdit
                    ? html`
                        <div
                            class="camera-item"
                            on-click="${() => this.shadowRoot.getElementById(`add-new-camera-modal-${roomIndex}`).open()}">
                            <img class="appliance-icon" src="images/add-plus-button.png"/>
                            <p>Add Camera</p>
                        </div>`
                    : null
            } </div>`;
        };

        const roomDevices = (devices, roomIndex) => {
            return devices.map((device) => {
                const onEdit = rooms[roomIndex].onEdit;

                return html`
                    <div class="device-pill">
                        <span class="pill-content">${device.name}</span>
                        ${
                            onEdit
                                ? html`
                                    <mwc-icon
                                        on-click="${() => this._removeDevice(device.name)}">
                                        close
                                    </mwc-icon>`
                                : null
                        }
                    </div>
                `;
            });
        };

        const roomsValues = values(rooms);
        const roomsItems = roomsValues.map((item, roomIndex) => {
            const room = rooms[roomIndex];
            const onEdit = room.onEdit;

            return html`
                <style>
                    paper-fab {
                        margin: 5px;
                        color: #2B5788;
                        --paper-fab-background: white;
                        --paper-fab-keyboard-focus-background: white;
                    }
                    #slides {
                        width: auto;
                    }
                    [id|=next-slide], [id|=prev-slide] {
                        position: absolute;
                        top: 110px;
                    }
                    .next {
                        right: 0 !important;
                        display: none;
                    }
                    .prev {
                        left: 0 !important;
                        display: none;
                    }
                </style>
                <paper-dialog id="add-new-device-modal-${roomIndex}" with-backdrop>
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
                            <mwc-button class="blue-button" dialog-confirm label="Add This Device" disabled="${!(this.newDevice.deviceID || this.newDevice.deviceCode)}"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-remote-modal-${roomIndex}" with-backdrop>
                    <div class="modal-content">
                        <label id="appliance-type">Choose Remote:</label>
                        <paper-radio-group
                            id="remote-type-${roomIndex}"
                            aria-labelledby="appliance-type"
                            selected="tv"
                            on-change="${(e) => this._handleNewRemoteChange(e, 'type', roomIndex)}"
                        >
                            <paper-radio-button on-click="${(e) => this._setBrandList(e, roomIndex)}" name="tv">TV</paper-radio-button>
                            <paper-radio-button on-click="${(e) => this._setBrandList(e, roomIndex)}" name="ac">AC</paper-radio-button>
                        </paper-radio-group>
                        <paper-dropdown-menu
                            label="Remote TV"
                            id="tv-brandlist-${roomIndex}"
                            noink no-animations
                        >
                            <paper-listbox id="tv-selected-${roomIndex}" class="dropdown-content" slot="dropdown-content" selected="0">
                                ${brandsTV.map((brand) => {
                                    return html`
                                        <paper-item on-tap="${(e) => this._handleNewRemoteChange(e, 'brand', roomIndex)}" value="${toTitleCase(brand)}">${toTitleCase(brand)}</paper-item>`;
                                })}
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu
                            label="Remote AC"
                            id="ac-brandlist-${roomIndex}"
                            style="display: none"
                            noink no-animations
                        >
                            <paper-listbox id="ac-selected-${roomIndex}" class="dropdown-content" slot="dropdown-content" selected="0">
                                ${brandsAC.map((brand) => {
                                    return html`
                                        <paper-item on-tap="${(e) => this._handleNewRemoteChange(e, 'brand', roomIndex)}" value="${toTitleCase(brand)}">${toTitleCase(brand)}</paper-item>`;
                                })}
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <div class="buttons">
                            <mwc-button class="blue-button" dialog-confirm label="Add This Remote" on-click="${() => this._handleNewRemoteAdd(item.id, roomIndex)}"></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-dialog id="add-new-camera-modal-${roomIndex}" with-backdrop>
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
                            <mwc-button class="blue-button" dialog-confirm label="Add This Camera" ></mwc-button>
                        </div>
                    </div>
                </paper-dialog>
                <paper-material id="material-${roomIndex}" elevation="1">
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
                                        class="blue-button"
                                        label="Exit Edit"
                                        icon="close"
                                        on-click="${() => this._exitOnEdit(roomIndex)}">
                                    </mwc-button>
                                    <mwc-button
                                        class="blue-button"
                                        label="Delete Room"
                                        icon="delete"
                                        on-click="${() => this._removeRoom(roomIndex)}">
                                    </mwc-button>`
                                : html`
                                    <style>
                                        mwc-button.mwc-edit {
                                            display: inline-block;
                                            position: absolute;
                                            right: 1rem;
                                            top: 1rem;
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
                                        .feature-anchor {
                                            text-decoration: none;
                                        }
                                    </style>
                                    <h1>${item.name}</h1>
                                    <mwc-button
                                        dense
                                        class="mwc-edit blue-button"
                                        label="Edit"
                                        icon="edit"
                                        on-click="${() => this._enterOnEdit(roomIndex)}">
                                    </mwc-button>
                                    <div class="top-button">
                                        <a class="feature-anchor" href="/dashboard/room-schedule" on-click="${() => this._handleActiveRoom(room, roomIndex)}">
                                            <mwc-button
                                                class="mwc-schedule blue-button"
                                                label="Schedule"
                                                icon="calendar_today">
                                            </mwc-button>
                                        </a>
                                        <a class="feature-anchor" href="/dashboard/room-location" on-click="${() => this._handleActiveRoom(room, roomIndex)}">
                                            <mwc-button
                                                class="mwc-location blue-button"
                                                label="Location"
                                                icon="location_on">
                                            </mwc-button>
                                        </a>
                                    </div>`
                        }
                    </div>
                    <div id="remotes-${roomIndex}" class="room-remotes" on-scroll="${(e) => this._scroll(e, roomIndex)}">
                        ${addRemote(onEdit, roomIndex)}
                        ${values(roomRemotes(item.remotes, roomIndex))}
                        <div id="slides">
                            <paper-fab id="prev-slide-${roomIndex}" class="prev" mini icon="image:navigate-before" on-click="${(e) => this._scrollLeft(roomIndex, 'left')}"></paper-fab>
                            <paper-fab id="next-slide-${roomIndex}" class="next" mini icon="image:navigate-next" on-click="${(e) => this._scrollLeft(roomIndex, 'right')}"></paper-fab>
                        </div>
                    </div>
                    <div class="room-devices">
                        ${roomDevices(values(item.devices), roomIndex)}
                        ${
                            onEdit
                                ? html`
                                    <mwc-button
                                        class="blue-button add-device-button"
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

                .room-title paper-button {
                    display: inline-block;
                }

                .room-title h1 {
                    display: inline-block;
                    font-weight: normal;
                    font-size: 1.2rem;
                    margin-bottom: 0px !important;
                    margin-top: 0px !important;
                }

                .top-button {
                    margin: 0.5rem 0;
                }

                /* .room-remotes { */
                [id|=remotes] {
                    width: 100%;
                    display: block;
                    overflow: auto;
                    white-space: nowrap;
                }

                @media screen and (max-width: 375px) {
                    .remote-item {
                        width: 42% !important;
                        height: 120px !important;
                    }
                    .camera-item {
                        width: 42% !important;
                        height: 120px !important;
                    }
                }

                @media screen and (max-width: 320px) {
                    .remote-item {
                        width: 115px !important;
                        height: 120px !important;
                    }
                    .camera-item {
                        width: 115px !important;
                        height: 120px !important;
                    }
                }

                .remote-item, .camera-item {
                    text-align: center;
                    display: inline-block;
                    vertical-align: top;
                    padding: 10px;
                    width: 120px;
                    height: 120px;
                    padding: 5px;
                    margin-right: 0.5rem;
                    border-radius: 10px;
                    border: 1px solid #0000000f;
                }

                .remote-item:hover, .camera-item:hover {
                    background-color: #f5f5f5;
                    cursor: pointer;
                }

                .remote-item p, .camera-item p  {
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
                    margin-top: 0.5rem;
                    margin-right: 5px;
                    --mdc-icon-size: 16px;
                }

                .device-pill mwc-icon {
                    margin-top: 7px;
                    margin-bottom: 7px;
                }

                .device-pill .pill-content, .device-pill mwc-icon {
                    vertical-align: top;
                    display: inline-block;
                }

                .appliance-icon {
                    height: 50px;
                    padding-top: 25px;
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
                    max-width: 680px;
                    padding: 0 0.8rem 5rem;
                }

                paper-dialog {
                    z-index: 99999;
                    border-radius: 5px;
                }

                paper-material {
                    position: relative;
                    display: block;
                    margin: 1rem 0;
                    padding: 1rem;
                    border-radius: 5px;
                    background-color: white;
                }

                paper-material.add-new-room {
                    text-align: center;
                    margin: 20px;
                    padding: 10px !important;
                    border-radius: 5px;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                    line-height: 80vh;
                }

                .light-button {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }

                .blue-button {
                    --mdc-theme-on-primary: white;
                    --mdc-theme-primary: #4664ae;
                    --mdc-theme-on-secondary: white;
                    --mdc-theme-secondary: #4664ae;
                }

                .add-device-button {
                    display: inline-block;
                    margin-top: 1rem;
                }

                .wide {
                    width: 100%;
                    margin: 1rem 0 0 !important;
                }
            </style>
            <paper-dialog id="add-new-room-modal" with-backdrop>
                <div class="modal-content">
                    <paper-input
                        id="roomName"
                        label="Enter Room Name"
                        always-float-label>
                    </paper-input>
                    <mwc-button dialog-confirm label="Add This Room" on-click="${() => this._addNewRoom()}"></mwc-button>
                </div>
            </paper-dialog>
            <div class="rooms-container">
                <div class="paper-container">
                    ${roomsItems}
                    <mwc-button raised class="wide light-button" label="Add new room" icon="add" on-click="${() => this.shadowRoot.getElementById('add-new-room-modal').open()}" />
                </div>
            </div>
    `;
    }
}

customElements.define('main-rooms', MainRooms);
