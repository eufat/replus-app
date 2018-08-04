import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import '@polymer/paper-card';
import '@polymer/paper-material';
import '@polymer/paper-icon-button';

import {env} from '../configs.js';
import {getDateFromFilename, getTVBrandFromCodeset, getTVCommandFromCodeset, toTitleCase, modesAC, fansAC, camelToSentence} from '../utils.js';
import '@polymer/iron-icons/iron-icons';
import {store} from '../store';

import {getEventsDummy, getRemoteActivityDummy} from '../dummy.js';

const get = _.get;

const VISION_ACTIVITY = env.VISION_ACTIVITY;
const CORE_ACTIVITY = env.CORE_ACTIVITY;

export default class activityMain extends connect(store)(LitElement) {
    static get properties() {
        return {
            activityStatus: String,
            activityURL: String,
            activityEvents: Array,
            storedEvents: Array,
            active: Boolean,
            rooms: Array,
        };
    }

    constructor() {
        super();
        this.activityURL = 'Not set';
        this.activityStatus = 'Not available';
        this.activityEvents = [];
        this.storedEvents = [];
        this.rooms = [];
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _didRender() {
        /*
        const url = `${VISION_ACTIVITY}/p1z3r02`;
        this.activityURL = url;
        const socket = io(url);
        socket.on('connect', () => {
            this.activityStatus = 'Connected';
        });
        socket.on('disconnect', () => {
            this.activityStatus = 'Disconnected';
        });
        socket.on('frame_now', (data) => {
            this.addFrameRealtime(data);
        });
        socket.on('frame_before', (data) => {
            this.addFrameStored(data);
        });
        */

        const url = `${CORE_ACTIVITY}`;
        const socket = io(url);

        socket.on('connect', () => {
            this.activityStatus = 'Connected';
        });

        socket.on('disconnect', () => {
            this.activityStatus = 'Disconnected';
        });

        for (let room of this.rooms) {
            console.log(`Listening to room ${room.id}`);
            socket.on(room.id, (data) => {
                data.room = room.name;
                this.addRealtimeActivity(data);
            });
        }
    }

    addRealtimeActivity(data) {
        const date = new Date(+data.date);

        const type = data.command.indexOf('-') > -1 ? 'AC' : 'TV';
        const brand = type === 'AC' ? data.command.split('-')[0] : getTVBrandFromCodeset(data.command.substring(0, 4));
        let actionMessage = '';

        if (type === 'AC') {
            const codesetAC = data.command.split('-')[1];
            const codesetMode = codesetAC.substring(0, 1);
            const codesetFan = codesetAC.substring(1, 2);
            const codesetTemp = codesetAC.substring(2, 4);
            actionMessage = `set to fan ${fansAC[codesetFan].toLowerCase()} mode ${modesAC[codesetMode].toLocaleLowerCase()} and temp ${codesetTemp}°C`;
        } else if (type === 'TV') {
            const codesetTV = data.command.substring(5, 9);
            actionMessage = `set to ${camelToSentence(getTVCommandFromCodeset(codesetTV))}`;
        }

        const actionType = '';

        const newActivity = {
            message: `${type} ${toTitleCase(brand)} ${actionMessage}`,
            event: actionType,
            room: data.room,
            date,
            source: data.source,
        };

        this.activityEvents = [...this.activityEvents, newActivity];
    }

    addFrameRealtime(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.activityEvents, {data: newData, name: frame.name, dev_id: frame.dev_id}];
        this.activityEvents = frames;
    }

    addFrameStored(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.storedEvents, {data: newData, frame: frame.name, dev_id: frame.dev_id}];
        this.storedEvents = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    _render({activityStatus, activityEvents, storedEvents, activityURL}) {
        const activityIcon = html`
                <svg class="time-icon time-icon-activity" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10.86 7c-.45-1.72-2-3-3.86-3-1.86 0-3.41 1.28-3.86 3H0v2h3.14c.45 1.72 2 3 3.86 3 1.86 0 3.41-1.28 3.86-3H14V7h-3.14zM7 10.2c-1.22 0-2.2-.98-2.2-2.2 0-1.22.98-2.2 2.2-2.2 1.22 0 2.2.98 2.2 2.2 0 1.22-.98 2.2-2.2 2.2z"></path>
                </svg>
            `;

        const eventsItems = (items) => {
            return items.map((item, index) => {
                const dateFromFilename = getDateFromFilename(item.name);
                const formattedDate = dayjs(dateFromFilename).format(' HH:mm:ss A DD MMM YYYY');
                return html`
                <div class="activity-group-title">
                    ${activityIcon}
                    Activity from ${item.dev_id} on ${formattedDate}
                </div>
                <paper-material class="activity-group" elevation="0">
                    <img src="${item.data}"></img>
                </paper-material>
            `;
            });
        };

        const data = this.activityEvents;

        const activityItems = data.map((item) => {
            const messageIcon = () => {
                switch (item.event) {
                    case 'increase_temp':
                        return html`<iron-icon icon="icons:icons:arrow-upward" />`;
                    case 'decrease_temp':
                        return html`<iron-icon icon="icons:icons:arrow-downward" />`;
                    case 'turn_on':
                        return html`<iron-icon icon="icons:power-settings-new" />`;
                    case 'turn_off':
                        return html`<iron-icon icon="icons:power-settings-new" />`;
                    case 'add_schedule':
                        return html`<iron-icon icon="icons:date-range" />`;
                    case 'remove_schedule':
                        return html`<iron-icon icon="icons:date-range" />`;
                }
            };

            const formattedDate = dayjs(item.date).format('HH:mm:ss A DD MMM YYYY');

            return html`
                <div class="activity-group-title">
                    ${activityIcon}
                    <iron-icon icon="icons:schedule"></iron-icon>
                    ${formattedDate}
                </div>
                <paper-material class="activity-group">
                    <h4>${messageIcon()} ${item.message}</h4>
                    <p>at ${item.room} source ${item.source}</p>
                </paper-material>
            `;
        });

        return html`
            <style>
                .event-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                img {
                    height: 300px;
                }

                .activities-listing::before {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 14px;
                    z-index: -1;
                    display: block;
                    width: 2px;
                    content: "";
                    background-color: #eff1f3;
                }

                .activities-listing-padded {
                    padding-left: 39px;
                }

                .activities-listing {
                    position: relative;
                    padding-bottom: 20px;
                    margin-bottom: 15px;
                }

                .activity-group-title {
                    margin-top: 15px;
                    margin-left: -31px;
                    color: #586069;
                }

                .activity-group-title .time-icon-activity {
                    margin-right: 17px;
                    color: #c6cbd1;
                    background: #fafafa;
                }

                svg:not(:root) {
                    overflow: hidden;
                }

                .time-icon {
                    display: inline-block;
                    vertical-align: text-bottom;
                    fill: currentColor;
                }

                .test {
                    display: block;
                    height: 100px;
                }

                .container {
                    margin: 0 auto;
                    max-width: 960px;
                }

                paper-material {
                    display: block;
                    margin: 20px;
                    margin-left: 0;
                    padding: 10px 20px;
                    background-color: white;
                    border-radius: 5px;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                    line-height: 80vh;
                }

                .activity-group {
                    margin-top: 10px;
                    list-style-type: none;
                }

                p {
                    margin: 0;
                }
            </style>
            <div class="container">
                    ${
                        data.length > 0
                            ? html`
                                <div class="activities-listing activities-listing-padded">${activityItems}</div>`
                            : html`
                                <div class="center-vh">
                                    <p>Your activity is empty.<p>
                                </div>`
                    }
            </div>
    `;
    }
}

customElements.define('main-activity', activityMain);
