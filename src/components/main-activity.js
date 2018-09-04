import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import '@polymer/paper-card';
import '@polymer/paper-material';
import '@polymer/paper-icon-button';

import {env} from '../configs.js';
import {getDateFromFilename, getTVBrandFromCodeset, getTVCommandFromCodeset, toTitleCase, modesAC, fansAC, camelToSentence, log} from '../utils.js';
import '@polymer/iron-icons/iron-icons';
import {store} from '../store';

// import {getEventsDummy, getRemoteActivityDummy} from '../dummy.js';

const get = _.get;
const values = _.values;

// const VISION_ACTIVITY = env.VISION_ACTIVITY;
const CORE_ACTIVITY = env.CORE_ACTIVITY;

export default class activityMain extends connect(store)(LitElement) {
    static get properties() {
        return {
            activityStatus: String,
            activityURL: String,
            realtimeAcitivities: Array,
            storedActivities: Array,
            active: Boolean,
            rooms: Array,
            listening: Boolean,
            notification: String,
        };
    }

    constructor() {
        super();
        this.activityURL = 'Not set';
        this.activityStatus = 'Not available';
        this.realtimeAcitivities = [];
        this.storedActivities = [];
        this.rooms = [];
        this.listening = false;
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.storedActivities = values(get(state, 'activity.activities')).map((data) => this.formatActivity(data));
        this.notification = get(state, 'app.notification');
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

        Notification.requestPermission((status) => {
            console.log('Notification permission status:', status);
        });

        // if (Notification.permission !== 'granted') {
        //     Notification.requestPermission((permission) => {
        //         if (!('permission' in Notification)) {
        //             Notification.permission = permission;
        //         }
        //     });
        // }

        if (this.rooms.length > 0 && !this.listening) {
            const url = `${CORE_ACTIVITY}/activity`;
            const socket = io(url);

            socket.on('connect', () => {
                this.activityStatus = 'Connected';
            });

            socket.on('disconnect', () => {
                this.activityStatus = 'Disconnected';
            });

            for (let room of this.rooms) {
                log(`Listening to room ${room.id}`);
                socket.on(room.id, (data) => {
                    data.room = room.name;
                    this.realtimeAcitivities = this.formatActivity(data);
                });
            }

            this.listening = true;
        }
    }

    displayNotification(message) {
        const options = {
            body: message,
        };
        if (Notification.permission == 'granted') {
            if (this.notification == 'true') {
                navigator.serviceWorker.getRegistration().then((reg) => {
                    reg.showNotification('Replus Remote', options);
                });
            }
        }
    }

    formatActivity(data) {
        const date = new Date(+data.date);

        const type = data.command.indexOf('-') > -1 ? 'AC' : 'TV';
        const brand = type === 'AC' ? data.command.split('-')[0] : getTVBrandFromCodeset(data.command.substring(0, 4));
        let actionMessage = '';

        if (type === 'AC') {
            const codesetAC = data.command.split('-')[1];
            const codesetMode = codesetAC.substring(0, 1);
            const codesetFan = codesetAC.substring(1, 2);
            const codesetTemp = codesetAC.substring(2, 4);
            actionMessage = `set to ${fansAC[codesetFan].toLowerCase()} fan with ${modesAC[codesetMode].toLowerCase()} mode and ${codesetTemp}°C temperature`;
        } else if (type === 'TV') {
            const codesetTV = data.command.substring(4, 9);
            if (getTVCommandFromCodeset(codesetTV) != undefined) {
                actionMessage = `set to ${camelToSentence(getTVCommandFromCodeset(codesetTV))}`;
            }
        }

        const actionType = '';

        let room = this.rooms
            .map((obj) => {
                if (obj.id === data.room) {
                    return obj.name;
                } else {
                    return false;
                }
            })
            .filter((item) => item !== false)[0];

        room = room ? room : 'Unknown Room';

        const newActivity = {
            message: `${type} ${toTitleCase(brand)} ${actionMessage}`,
            event: actionType,
            room,
            date,
            source: data.source,
        };

        // this.displayNotification(newActivity.message);
        return newActivity;
    }

    addFrameRealtime(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.realtimeAcitivities, {data: newData, name: frame.name, dev_id: frame.dev_id}];
        this.realtimeAcitivities = frames;
    }

    addFrameStored(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.storedActivities, {data: newData, frame: frame.name, dev_id: frame.dev_id}];
        this.storedActivities = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    _render({activityStatus, realtimeAcitivities, storedActivities, activityURL}) {
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

        const data = [...this.realtimeAcitivities, ...this.storedActivities];

        function compare(a, b) {
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();

            if (dateA < dateB) return 1;
            if (dateA > dateB) return -1;
            return 0;
        }

        const sortedData = data.sort(compare);

        let activityItems = sortedData.map((item) => {
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

            const formattedDate = dayjs(item.date).format('HH:mm:ss DD MMM YYYY');

            return html`
                <div class="activity-group-title">
                    ${activityIcon}
                    <iron-icon icon="icons:schedule"></iron-icon>
                    ${formattedDate}
                </div>
                <paper-material class="activity-group">
                    <h4>${messageIcon()} ${item.message}</h4>
                    <p>at ${item.room} source from ${item.source}</p>
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
                    margin: 0 auto 4rem;
                    max-width: 960px;
                }

                paper-material {
                    display: block;
                    margin: 20px;
                    margin-left: 0;
                    padding: 15px;
                    background-color: white;
                    border-radius: 5px;
                }

                .activity-group {
                    margin-top: 10px;
                    list-style-type: none;
                }

                h4 {
                    margin-top: 0;
                    margin-bottom: 10px
                }

                p {
                    margin: 0;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                }

                .center-vh p {
                    position: relative;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .center-vh iron-icon {
                    margin-bottom: 1rem;
                    --iron-icon-fill-color: #5f6368;
                    --iron-icon-height: 48px;
                    --iron-icon-width: 48px;
                }
            </style>
            <div class="container">
                    ${
                        data.length > 0
                            ? html`
                                <div class="activities-listing activities-listing-padded">${activityItems}</div>`
                            : html`
                                <div class="center-vh">
                                    <p>
                                        <iron-icon icon="icons:view-day"></iron-icon><br />
                                        Your activity is empty
                                    </p>
                                </div>`
                    }
            </div>
    `;
    }
}

customElements.define('main-activity', activityMain);
