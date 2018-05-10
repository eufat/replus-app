import {LitElement, html} from '@polymer/lit-element';
import '@polymer/paper-card/paper-card.js';

import {env} from '../configs.js';
import {getEventsDummy, getDateFromFilename} from '../utils.js';

const HOST_ADDRESS = env.HOST_ADDRESS;
let EVENTS_PORT = env.EVENTS_PORT;
EVENTS_PORT = EVENTS_PORT ? `:${EVENTS_PORT}` : '';

export default class VisionEvents extends LitElement {
    static get properties() {
        return {
            realtimeStatus: String,
            realtimeEvents: {
                type: Array,
                value: [],
            },
            storedEvents: {
                type: Array,
                value: [],
            },
        };
    }

    constructor() {
        super();
        this.status = 'Not available';
        this.realtimeEvents = getEventsDummy();
    }

    addFrame(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [
            ...this.realtimeEvents,
            {data: newData, name: frame.name, dev_id: frame.dev_id},
        ];
        this.realtimeEvents = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    _firstRendered() {
        const url = `ws://${HOST_ADDRESS}${EVENTS_PORT}/`;
        const socket = io(url);

        socket.on('connect', () => {
            this.status = 'Connected';
        });

        socket.on('disconnect', () => {
            this.status = 'Disconnected';
        });

        socket.on('frame', (data) => {
            this.addFrame(data);
        });
    }

    _render() {
        return html`
        <style>
            .event-container {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            paper-card {
                width: 480px;
                margin-bottom: 20px;

            }
        </style>
        <div>
            <p class="event-container">Connection status: [[status]]</p>
            <template is="dom-repeat" items="[[realtimeEvents]]">
                <div class="event-container">
                    <paper-card image="[[item.data]]">
                        <div class="card-content">
                            <p>From [[item.dev_id]] at [[getDateFromFilename(item.name)]]</p>
                        </div>
                    </paper-card>
                </div>
            </template>
            <template is="dom-repeat" items="[[storedEvents]]">
                <paper-card image="[[item.data]]">
                    <div class="card-content">
                        <p>From [[item.dev_id]] at [[getDateFromFilename(item.name)]]</p>
                    </div>
                </paper-card>
            </template>
        </div>
    `;
    }
}

customElements.define('vision-events', VisionEvents);
