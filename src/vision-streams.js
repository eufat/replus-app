import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

export default class VisionStreams extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Streams</div>
    `;
    }
}

customElements.define('vision-streams', VisionStreams);
