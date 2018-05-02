import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusVisionStreams extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Streams</div>
    `;
    }
}

customElements.define('rs-vision-streams', ReplusVisionStreams);
