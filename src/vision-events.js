import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class VisionEvents extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Events</div>
    `;
    }
}

customElements.define('vision-events', VisionEvents);
