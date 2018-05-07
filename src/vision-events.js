import {
    PolymerElement,
    html,
} from '/node_modules/@polymer/polymer/polymer-element.js';
import {env} from './configs.js';

const HOST_ADDRESS = env.HOST_ADDRESS;
let WS_PORT = env.WS_PORT;
WS_PORT = WS_PORT ? `:${WS_PORT}` : '';

export default class VisionEvents extends PolymerElement {
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
    }

    addFrame(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [
            ...this.realtimeEvents,
            {data: newData, name: frame.name, dev_id: frame.dev_id},
        ];
        this.realtimeEvents = frames;
    }

    ready() {
        super.ready();
        const endpoint = `ws://${HOST_ADDRESS}${WS_PORT}/`;
        const socket = io(endpoint);

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

    static get template() {
        return html`
            <p>Websocket status is: [[status]]</p>
            <template is="dom-repeat" items="[[realtimeEvents]]">
                <div >
                    <p>From [[item.dev_id]] at [[getDateFromFilename(item.name)</p>
                    <img
                        height="240px"
                        src={item.data}
                    />
                    <br />
                </div>
            </template>
            <template is="dom-repeat" items="[[storedEvents]]">
                <div >
                    <p>From [[item.dev_id]] at [[getDateFromFilename(item.name)</p>
                    <img
                        height="240px"
                        src={item.data}
                    />
                    <br />
                </div>
            </template>
    `;
    }
}

customElements.define('vision-events', VisionEvents);
