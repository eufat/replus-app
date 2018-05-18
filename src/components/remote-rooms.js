import {LitElement, html} from '@polymer/lit-element';
import {getRoomsDummy} from '../utils';

import '@polymer/paper-item/paper-item.js';
import {Button} from '@material/mwc-button/mwc-button.js';
import {Icon} from '@material/mwc-icon/mwc-icon.js';

export default class RemoteRooms extends LitElement {
    static get properties() {
        return {
            rooms: Array,
        };
    }

    constructor() {
        super();
        this.rooms = getRoomsDummy();
    }

    toggleOnEdit(roomIndex) {
        const prevOnEditState = this.rooms[roomIndex].onEdit;
        this.rooms[roomIndex].onEdit = !prevOnEditState;
    }

    _render({rooms}) {
        const roomRemotes = (remotes) =>
            _.values(
                _.mapValues(remotes, (remote) => {
                    const applicanceType = remote.split(' ')[0].toLowerCase();

                    return html`
                <div class="remote-item">
                    <mwc-button label="Remove" icon="close"></mwc-button>
                    <img class="appliance-icon" src="/images/${applicanceType}-icon.png"/>
                    <p>${remote}</p>
                </div>
            `;
                })
            );

        const roomDevices = (devices) =>
            _.values(
                _.mapValues(devices, (deviceId) => {
                    return html`
                <div class="device-pill">
                    <span class="pill-content">${deviceId}</span> <mwc-icon>close</mwc-icon>
                </div>
            `;
                })
            );

        const roomsItems = rooms.map((item, roomIndex) => {
            return html`
                <paper-material>
                    <div class="room-title">
                        <h1>${item.name}</h1>
                        <mwc-button label="Edit" icon="edit" on-click="${() =>
                            this.toggleOnEdit(roomIndex)}"></mwc-button>
                            <mwc-button label="Delete Room" icon="delete"></mwc-button>
                            <mwc-button label="Save Changes" icon="save"></mwc-button>
                    </div>
                    <div class="room-remotes">
                        ${roomRemotes(item.remotes)}
                        <div class="remote-item">
                            <img class="appliance-icon" src="/images/add-plus-button.png"/>
                            <p>Add Remote</p>
                        </div>
                    </div>
                    <div class="room-devices">
                        ${roomDevices(item.devices)}
                        <mwc-button label="Assign device" icon="add"></mwc-button>
                    </div>
                </paper-material>
            `;
        });

        console.log('onEdit on render', this.rooms[0].onEdit);

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

                .items-container {
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
                <div class="items-container">
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
