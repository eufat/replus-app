import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class VisionStreams extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Streams</div>
    `;
    }
}

customElements.define('vision-streams', VisionStreams);
