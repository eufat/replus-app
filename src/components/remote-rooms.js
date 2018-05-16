import {LitElement, html} from '@polymer/lit-element';
import {getRoomsDummy} from '../utils';

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

    _render({rooms}) {
        const roomRemotes = (remotes) =>
            _.values(
                _.mapValues(remotes, (remote) => {
                    const applicanceType = remote.split(' ')[0].toLowerCase();

                    return html`
                <div id="remote-item">
                    <img id="appliance-icon" src="/images/${applicanceType}-icon.png"/>
                    <p>${remote}</p>
                </div>
            `;
                })
            );

        const roomDevices = (devices) =>
            _.values(
                _.mapValues(devices, (deviceId) => {
                    return html`
                <div id="device-pill">
                    ${deviceId}
                </div>
            `;
                })
            );

        const roomsItems = rooms.map((item) => {
            return html`
                <paper-material>
                    <div id="room-title">
                        <h2>${item.name}</h2>
                    </div>
                    <div id="room-remotes">
                        ${roomRemotes(item.remotes)}
                    </div>
                    <div id="room-devices">
                        ${roomDevices(item.devices)}
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

                #remote-item {
                    text-align: center;
                    display: inline-block;
                    padding: 5px;
                    width: 100px;
                    height: 100px;
                }

                #remote-item p {
                    margin: 0;
                }

                #device-pill {
                    background-color: #ccc;
                    border-radius: 15px;
                    display: inline-block;
                    text-align: center;
                    width: 60px;
                    height: 30px;
                    line-height: 30px;
                    margin: 5px;
                }

                #add-new-room {
                    text-align: center;

                }

                #appliance-icon {
                    height: 50px;
                }

                #add-new-room-icon {
                    font-size: 4em;
                }

                h2 {
                    margin: 0;
                    font-size: 1.25em;
                }

                paper-material {
                    display: block;
                    margin: 20px auto;
                    width: 600px;
                    padding: 10px 20px;
                    background-color: white;
                }
            </style>
            <div id="rooms-container">
                ${roomsItems}
                <paper-material id="add-new-room">
                    <h2>Add New Room</h2>
                    <span id="add-new-room-icon">+</span>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
