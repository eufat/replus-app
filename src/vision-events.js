import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

export default class VisionEvents extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Events</div>
    `;
    }
}

customElements.define('vision-events', VisionEvents);
