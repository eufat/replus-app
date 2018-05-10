import {LitElement, html} from '@polymer/lit-element';

import {env} from '../configs.js';

const HOST_ADDRESS = env.HOST_ADDRESS;
let STREAM_PORT = env.STREAM_PORT;
STREAM_PORT = STREAM_PORT ? `:${STREAM_PORT}` : '';

export default class VisionStreams extends LitElement {
    _firstRendered() {
        const canvas = this.$.streamingCanvas;
        const url = `ws://${HOST_ADDRESS}${STREAM_PORT}/`;
        const player = new JSMpeg.Player(url, {canvas: canvas});
    }

    _render() {
        return html`
            <div id="streamingCanvas"></div>
    `;
    }
}

customElements.define('vision-streams', VisionStreams);
