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
            realtimeURL: String,
            realtimeEvents: Array,
            storedEvents: Array,
        };
    }

    constructor() {
        super();
        this.realtimeURL = 'Not set';
        this.realtimeStatus = 'Not available';
        this.realtimeEvents = [];
        this.storedEvents = [];
    }

    addFrameRealtime(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [
            ...this.realtimeEvents,
            {data: newData, name: frame.name, dev_id: frame.dev_id},
        ];
        this.realtimeEvents = frames;
    }

    addFrameStored(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [
            ...this.storedEvents,
            {data: newData, name: frame.name, dev_id: frame.dev_id},
        ];
        this.storedEvents = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    _didRender() {
        const url = `ws://${HOST_ADDRESS}${EVENTS_PORT}`;
        this.realtimeURL = url;

        const socket = io(url);

        socket.on('connect', () => {
            this.realtimeStatus = 'Connected';
        });

        socket.on('disconnect', () => {
            this.realtimeStatus = 'Disconnected';
        });

        socket.on('frame_now', (data) => {
            this.addFrameRealtime(data);
        });

        socket.on('frame_before', (data) => {
            this.addFrameStored(data);
        });
    }

    _render({realtimeStatus, realtimeEvents, storedEvents, realtimeURL}) {
        const eventsItems = (items) => {
            return items.map((item, index) => {
                const date = getDateFromFilename(item.name);
                return html`
                <div class="event-container">
                    <paper-card image="${item.data}">
                        <div class="card-content">
                            <p>From ${item.dev_id} at ${date}</p>
                        </div>
                    </paper-card>
                </div>
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
            paper-card {
                width: 480px;
                margin-bottom: 20px;
            }
        </style>
        <div>
            <p class="event-container">Listening on: ${realtimeURL}</p>
            <p class="event-container">Connection status: ${realtimeStatus}</p>
            ${realtimeItems}
            ${storedItems}
        </div>
    `;
    }
}

customElements.define('vision-events', VisionEvents);
