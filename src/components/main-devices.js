import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';

import {store} from '../store.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

import {fetchRooms} from '../actions/remote';
import {brandsList, toTitleCase} from '../utils';

const get = _.get;

export default class MainDevices extends connect(store)(LitElement) {
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

    // _didRender(props, changedProps, prevProps) {
    //     if (changedProps.uid) {
    //         store.dispatch(fetchRooms());
    //     }
    // }

    _firstRendered() {
        store.dispatch(fetchRooms());
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.rooms = _.get(state, 'remote.rooms');
        this.uid = _.get(state, 'app.currentUser.uid');
    }

    _render({rooms}) {
        const roomDevices = (devices, roomIndex) => {
            return devices.map((device, index) => {
                return html`
                    <paper-item>
                        <paper-item-body>
                            <p>${device.type}</p>
                        </paper-item-body>
                        <div class="settings-right">
                            <div class="device-pill">
                                <span class="pill-content">${device.name}</span>
                            </div>
                        </div>
                    </paper-item>
                `;
            });
        };

        const roomsValues = _.values(rooms);
        const roomsItems = roomsValues.map((item, roomIndex) => {
            return html`
                <paper-material elevation="0">
                    <div class="room-devices">
                        ${roomDevices(_.values(item.devices), roomIndex)}
                    </div>
                </paper-material>
            `;
        });

        return html`
        <style>
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
        </style>
        <div role="listbox" class="settings">
            <paper-item>
                <paper-item-body>
                    <div>Replus Remote</div>
                </paper-item-body>
            </paper-item>
            ${roomsItems}
        </div>
    `;
    }
}

customElements.define('main-devices', MainDevices);
