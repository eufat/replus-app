import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@polymer/paper-item/paper-item.js';
import {Button} from '@material/mwc-button/mwc-button.js';
import {Icon} from '@material/mwc-icon/mwc-icon.js';

import {setRooms} from '../actions/remote';
import {getRoomsDummy} from '../utils';
import {store} from '../store.js';

export default class RemoteRooms extends connect(store)(LitElement) {
    static get properties() {
        return {
            rooms: Array,
        };
    }

    constructor() {
        super();
        store.dispatch(setRooms(getRoomsDummy()));
    }

    _stateChanged(state) {
        this.rooms = state.remote.rooms;
    }

    _toggleOnEdit(roomIndex) {
        const prevOnEditState = this.rooms[roomIndex].onEdit;
        let newRooms = [...this.rooms];
        newRooms[roomIndex].onEdit = !prevOnEditState;

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

    _render({rooms}) {
        const roomRemotes = (remotes, roomIndex) =>
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
                            <img class="appliance-icon" src="/images/${applicanceType}-icon.png"/>
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
                <paper-material>
                    <div class="room-title">
                        <h1>${item.name}</h1>
                            ${
                                onEdit
                                    ? html`
                                        <mwc-button label="Delete Room" icon="delete" on-click="${() =>
                                            this._removeRoom(
                                                roomIndex
                                            )}"></mwc-button>
                                        <mwc-button label="Save Changes" icon="save" on-click="${() =>
                                            this._toggleOnEdit(
                                                roomIndex
                                            )}"></mwc-button>`
                                    : html`
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
                                ? html`<div class="remote-item">
                                    <img class="appliance-icon" src="/images/add-plus-button.png"/>
                                    <p>Add Remote</p>
                                </div>`
                                : null
                        }
                    </div>
                    <div class="room-devices">
                        ${roomDevices(item.devices, roomIndex)}
                        ${
                            onEdit
                                ? html`<mwc-button label="Assign device" icon="add"></mwc-button>`
                                : null
                        }
                    </div>
                </paper-material>
            `;
        });

        return html`
            <style>
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
                    <mwc-button label="Add new room" icon="add"></mwc-button>
                </paper-material>
                </div>
            </div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
