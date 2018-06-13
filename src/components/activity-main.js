import {LitElement, html} from '@polymer/lit-element';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-material/paper-material.js';

import {env} from '../configs.js';
import {getDateFromFilename} from '../utils.js';
import {getEventsDummy} from '../dummy.js';

const VISION_ACTIVITY = env.VISION_ACTIVITY;

export default class activityMain extends LitElement {
    static get properties() {
        return {
            realtimeStatus: String,
            realtimeURL: String,
            realtimeEvents: Array,
            storedEvents: Array,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.realtimeURL = 'Not set';
        this.realtimeStatus = 'Not available';
        this.realtimeEvents = [];
        this.storedEvents = [];
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    addFrameRealtime(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.realtimeEvents, {data: newData, name: frame.name, dev_id: frame.dev_id}];
        this.realtimeEvents = frames;
    }

    addFrameStored(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.storedEvents, {data: newData, frame: frame.name, dev_id: frame.dev_id}];
        this.storedEvents = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    _didRender() {
        // const url = `${VISION_ACTIVITY}/p1z3r02`;
        // this.realtimeURL = url;
        // const socket = io(url);
        // socket.on('connect', () => {
        //     this.realtimeStatus = 'Connected';
        // });
        // socket.on('disconnect', () => {
        //     this.realtimeStatus = 'Disconnected';
        // });
        // socket.on('frame_now', (data) => {
        //     this.addFrameRealtime(data);
        // });
        // socket.on('frame_before', (data) => {
        //     this.addFrameStored(data);
        // });
    }

    _render({realtimeStatus, realtimeEvents, storedEvents, realtimeURL}) {
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

        const realtimeItems = eventsItems(realtimeEvents);
        const storedItems = eventsItems(storedEvents);

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

                .activity-group {
                    margin-top: 10px;
                    list-style-type: none;
                }
            </style>
            <div class="container">
                <div class="activities-listing activities-listing-padded">
                    ${realtimeItems}
                    ${storedItems}
                </div>
            </div>
            <div>
                <p class="event-container">Listening on: ${realtimeURL}</p>
                <p class="event-container">Connection status: ${realtimeStatus}</p>
            </div>
    `;
    }
}

customElements.define('activity-main', activityMain);
